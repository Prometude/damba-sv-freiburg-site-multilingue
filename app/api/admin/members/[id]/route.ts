import { NextResponse } from "next/server";

import {
  getDatabasePool,
} from "../../../../../lib/database";

import {
  isFinanciallyEligible,
} from "../../../../../lib/member-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ActionPayload = {
  action?: unknown;
  role?: unknown;
  contributionStatus?: unknown;
  memberNumber?: unknown;
  rejectionReason?: unknown;
  suspensionReason?: unknown;
};

const roles = [
  "member",
  "player",
  "coach",
  "committee",
  "treasurer",
  "admin",
];

const contributionStatuses = [
  "paid",
  "unpaid",
  "overdue",
  "exempt",
  "grace_period",
];

function cleanText(
  value: unknown,
  maxLength = 1000
) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

async function generateMemberNumber() {
  const pool = getDatabasePool();

  await pool.query(
    "SELECT pg_advisory_xact_lock(20260724)"
  );

  const year = new Date().getFullYear();

  const result = await pool.query<{
    member_number: string;
  }>(
    `
      SELECT member_number
      FROM membership_applications
      WHERE member_number LIKE $1
      ORDER BY member_number DESC
      LIMIT 1
    `,
    [`DSV-${year}-%`]
  );

  const lastNumber =
    result.rows[0]?.member_number;

  const lastSequence = lastNumber
    ? Number(lastNumber.split("-").at(-1))
    : 0;

  return `DSV-${year}-${String(
    lastSequence + 1
  ).padStart(4, "0")}`;
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  const pool = getDatabasePool();
  const { id } = await context.params;

  try {
    const body =
      (await request.json()) as ActionPayload;

    const action =
      cleanText(body.action, 50);

    const reviewer =
      process.env.ADMIN_USERNAME ||
      "Administrateur Damba";

    const existing =
      await pool.query<{
        id: string;
        application_status: string;
        membership_status: string;
        contribution_status: string;
        account_access_status: string;
        member_number: string | null;
      }>(
        `
          SELECT
            id,
            application_status,
            membership_status,
            contribution_status,
            account_access_status,
            member_number
          FROM membership_applications
          WHERE id = $1
          LIMIT 1
        `,
        [id]
      );

    const member = existing.rows[0];

    if (!member) {
      return NextResponse.json(
        {
          error: "Membre introuvable.",
        },
        {
          status: 404,
        }
      );
    }

    if (action === "approve") {
      await pool.query("BEGIN");

      try {
        const memberNumber =
          member.member_number ||
          (await generateMemberNumber());

        await pool.query(
          `
            UPDATE membership_applications
            SET
              application_status = 'approved',
              membership_status = 'active',
              member_number = $1,
              approved_at = NOW(),
              reviewed_at = NOW(),
              reviewed_by = $2,
              rejection_reason = NULL
            WHERE id = $3
          `,
          [
            memberNumber,
            reviewer,
            id,
          ]
        );

        await pool.query("COMMIT");

        return NextResponse.json({
          success: true,
          message:
            `Adhésion acceptée. Numéro attribué : ${memberNumber}`,
        });
      } catch (error) {
        await pool.query("ROLLBACK");
        throw error;
      }
    }

    if (action === "reject") {
      const reason =
        cleanText(
          body.rejectionReason,
          1000
        );

      if (reason.length < 5) {
        return NextResponse.json(
          {
            error:
              "Le motif du refus doit contenir au moins 5 caractères.",
          },
          {
            status: 400,
          }
        );
      }

      await pool.query(
        `
          UPDATE membership_applications
          SET
            application_status = 'rejected',
            membership_status = 'inactive',
            account_access_status = 'disabled',
            rejection_reason = $1,
            reviewed_at = NOW(),
            reviewed_by = $2
          WHERE id = $3
        `,
        [
          reason,
          reviewer,
          id,
        ]
      );

      return NextResponse.json({
        success: true,
        message: "La demande a été refusée.",
      });
    }

    if (action === "update_settings") {
      const role =
        cleanText(body.role, 50);

      const contributionStatus =
        cleanText(
          body.contributionStatus,
          50
        );

      const requestedMemberNumber =
        cleanText(
          body.memberNumber,
          50
        ).toUpperCase();

      if (!roles.includes(role)) {
        return NextResponse.json(
          {
            error: "Rôle incorrect.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        !contributionStatuses.includes(
          contributionStatus
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Statut de cotisation incorrect.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        requestedMemberNumber &&
        !/^DSV-\d{4}-\d{4,}$/.test(
          requestedMemberNumber
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Le numéro doit respecter le format DSV-2026-0001.",
          },
          {
            status: 400,
          }
        );
      }

      await pool.query(
        `
          UPDATE membership_applications
          SET
            member_role = $1,
            contribution_status = $2,
            member_number =
              CASE
                WHEN $3 = '' THEN member_number
                ELSE $3
              END
          WHERE id = $4
        `,
        [
          role,
          contributionStatus,
          requestedMemberNumber,
          id,
        ]
      );

      return NextResponse.json({
        success: true,
        message:
          "Les paramètres du membre ont été enregistrés.",
      });
    }

    if (action === "activate_access") {
      if (
        member.application_status !==
        "approved"
      ) {
        return NextResponse.json(
          {
            error:
              "L’adhésion doit être acceptée avant d’activer l’accès.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        !isFinanciallyEligible(
          member.contribution_status
        )
      ) {
        return NextResponse.json(
          {
            error:
              "La cotisation doit être à jour, exonérée ou en période de tolérance.",
          },
          {
            status: 400,
          }
        );
      }

      await pool.query(
        `
          UPDATE membership_applications
          SET
            membership_status = 'active',
            account_access_status =
              CASE
                WHEN account_access_status = 'not_created'
                  THEN 'not_created'
                ELSE 'active'
              END,
            suspended_at = NULL,
            suspension_reason = NULL
          WHERE id = $1
        `,
        [id]
      );

      return NextResponse.json({
        success: true,
        message:
          "L’accès du membre a été autorisé.",
      });
    }

    if (action === "limit_access") {
      await pool.query(
        `
          UPDATE membership_applications
          SET
            membership_status = 'limited',
            account_access_status = 'limited'
          WHERE id = $1
        `,
        [id]
      );

      return NextResponse.json({
        success: true,
        message:
          "Le membre dispose maintenant d’un accès limité.",
      });
    }

    if (action === "suspend_access") {
      const reason =
        cleanText(
          body.suspensionReason,
          1000
        );

      if (reason.length < 5) {
        return NextResponse.json(
          {
            error:
              "Le motif de suspension doit contenir au moins 5 caractères.",
          },
          {
            status: 400,
          }
        );
      }

      await pool.query(
        `
          UPDATE membership_applications
          SET
            membership_status = 'suspended',
            account_access_status = 'suspended',
            suspended_at = NOW(),
            suspension_reason = $1
          WHERE id = $2
        `,
        [
          reason,
          id,
        ]
      );

      await pool.query(
        `
          UPDATE member_sessions
          SET revoked_at = NOW()
          WHERE member_account_id IN (
            SELECT id
            FROM member_accounts
            WHERE member_id = $1
          )
          AND revoked_at IS NULL
        `,
        [id]
      );

      return NextResponse.json({
        success: true,
        message:
          "L’accès du membre a été suspendu.",
      });
    }

    return NextResponse.json(
      {
        error: "Action inconnue.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "Erreur de gestion administrative du membre :",
      error
    );

    return NextResponse.json(
      {
        error:
          "L’opération administrative a échoué.",
      },
      {
        status: 500,
      }
    );
  }
}
