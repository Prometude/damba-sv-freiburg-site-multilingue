import {
  NextResponse,
} from "next/server";

import {
  getDatabasePool,
} from "../../../../lib/database";

import {
  isFinanciallyEligible,
  verifyPassword,
} from "../../../../lib/member-auth";

import {
  createMemberSession,
} from "../../../../lib/member-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LoginPayload = {
  email?: unknown;
  password?: unknown;
};

type AccountRow = {
  account_id: string;
  member_id: string;
  password_hash: string | null;
  failed_login_count: number;
  locked_until:
    | Date
    | string
    | null;
  application_status: string;
  membership_status: string;
  contribution_status: string;
  account_access_status: string;
};

export async function POST(
  request: Request
) {
  const pool =
    getDatabasePool();

  try {
    const body =
      (await request.json()) as
        LoginPayload;

    const email =
      typeof body.email === "string"
        ? body.email
            .trim()
            .toLowerCase()
            .slice(0, 254)
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!email || !password) {
      return NextResponse.json(
        {
          error:
            "Adresse e-mail et mot de passe obligatoires.",
        },
        {
          status: 400,
        }
      );
    }

    const result =
      await pool.query<AccountRow>(
        `
          SELECT
            a.id AS account_id,
            m.id AS member_id,
            a.password_hash,
            a.failed_login_count,
            a.locked_until,
            m.application_status,
            m.membership_status,
            m.contribution_status,
            m.account_access_status
          FROM member_accounts a
          INNER JOIN membership_applications m
            ON m.id = a.member_id
          WHERE LOWER(a.email) = $1
          LIMIT 1
        `,
        [email]
      );

    const account =
      result.rows[0];

    const genericError =
      "Adresse e-mail ou mot de passe incorrect.";

    if (
      !account ||
      !account.password_hash
    ) {
      return NextResponse.json(
        {
          error: genericError,
        },
        {
          status: 401,
        }
      );
    }

    if (
      account.locked_until &&
      new Date(
        account.locked_until
      ).getTime() > Date.now()
    ) {
      return NextResponse.json(
        {
          error:
            "Ce compte est temporairement verrouillé. Réessayez plus tard.",
        },
        {
          status: 423,
        }
      );
    }

    const passwordValid =
      await verifyPassword(
        password,
        account.password_hash
      );

    if (!passwordValid) {
      const nextFailureCount =
        account.failed_login_count + 1;

      await pool.query(
        `
          UPDATE member_accounts
          SET
            failed_login_count = $1,
            locked_until =
              CASE
                WHEN $1 >= 5
                  THEN NOW() +
                    INTERVAL '15 minutes'
                ELSE NULL
              END,
            updated_at = NOW()
          WHERE id = $2
        `,
        [
          nextFailureCount,
          account.account_id,
        ]
      );

      return NextResponse.json(
        {
          error:
            nextFailureCount >= 5
              ? "Trop de tentatives incorrectes. Le compte est verrouillé pendant 15 minutes."
              : genericError,
        },
        {
          status: 401,
        }
      );
    }

    if (
      account.application_status !==
      "approved"
    ) {
      return NextResponse.json(
        {
          error:
            "Votre adhésion n’est pas encore validée.",
        },
        {
          status: 403,
        }
      );
    }

    if (
      ["suspended", "disabled", "locked"]
        .includes(
          account.account_access_status
        )
    ) {
      return NextResponse.json(
        {
          error:
            "Votre accès à l’espace membre est actuellement suspendu.",
        },
        {
          status: 403,
        }
      );
    }

    const financiallyEligible =
      isFinanciallyEligible(
        account.contribution_status
      );

    const limitedAccess =
      account.account_access_status ===
        "limited" ||
      account.membership_status ===
        "limited";

    if (
      !financiallyEligible &&
      !limitedAccess
    ) {
      return NextResponse.json(
        {
          error:
            "Votre situation financière doit être régularisée avant l’accès à l’espace membre.",
        },
        {
          status: 403,
        }
      );
    }

    await pool.query(
      `
        UPDATE member_accounts
        SET
          failed_login_count = 0,
          locked_until = NULL,
          last_login_at = NOW(),
          updated_at = NOW()
        WHERE id = $1
      `,
      [account.account_id]
    );

    await createMemberSession(
      request,
      account.account_id
    );

    await pool.query(
      `
        INSERT INTO member_audit_logs (
          actor_type,
          actor_identifier,
          action,
          entity_type,
          entity_id,
          details
        )
        VALUES (
          'member',
          $1,
          'member_login',
          'member_account',
          $2,
          '{}'::jsonb
        )
      `,
      [
        account.member_id,
        account.account_id,
      ]
    );

    return NextResponse.json({
      success: true,
      redirectTo: "/espace-membre",
    });
  } catch (error) {
    console.error(
      "Erreur de connexion membre :",
      error
    );

    return NextResponse.json(
      {
        error:
          "La connexion n’a pas pu être effectuée.",
      },
      {
        status: 500,
      }
    );
  }
}
