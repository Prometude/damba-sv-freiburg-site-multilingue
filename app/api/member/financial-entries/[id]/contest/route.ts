import {
  NextResponse,
} from "next/server";

import {
  getDatabasePool,
} from "../../../../../../lib/database";

import {
  getCurrentMember,
} from "../../../../../../lib/member-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type RequestBody = {
  reason?: unknown;
};

const contestableTypes = [
  "sanction",
  "damage_reimbursement",
  "other",
];

const contestableStatuses = [
  "pending",
  "partially_paid",
  "overdue",
];

export async function POST(
  request: Request,
  context: RouteContext
) {
  const member =
    await getCurrentMember();

  if (!member) {
    return NextResponse.json(
      {
        error:
          "Authentification membre requise.",
      },
      {
        status: 401,
      }
    );
  }

  const { id } = await context.params;

  try {
    const body =
      (await request.json()) as RequestBody;

    const reason =
      typeof body.reason === "string"
        ? body.reason.trim().slice(0, 2000)
        : "";

    if (reason.length < 10) {
      return NextResponse.json(
        {
          error:
            "Le motif doit contenir au moins 10 caractères.",
        },
        {
          status: 400,
        }
      );
    }

    const pool =
      getDatabasePool();

    const client =
      await pool.connect();

    try {
      await client.query("BEGIN");

      const result =
        await client.query<{
          id: string;
          entry_type: string;
          status: string;
        }>(
          `
            SELECT
              id,
              entry_type,
              status
            FROM member_financial_entries
            WHERE id = $1
              AND member_id = $2
            FOR UPDATE
            LIMIT 1
          `,
          [
            id,
            member.memberId,
          ]
        );

      const entry =
        result.rows[0];

      if (!entry) {
        await client.query("ROLLBACK");

        return NextResponse.json(
          {
            error:
              "Écriture financière introuvable.",
          },
          {
            status: 404,
          }
        );
      }

      if (
        !contestableTypes.includes(
          entry.entry_type
        )
      ) {
        await client.query("ROLLBACK");

        return NextResponse.json(
          {
            error:
              "Cette écriture ne peut pas être contestée depuis cet espace.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        !contestableStatuses.includes(
          entry.status
        )
      ) {
        await client.query("ROLLBACK");

        return NextResponse.json(
          {
            error:
              "Cette écriture ne peut plus être contestée.",
          },
          {
            status: 400,
          }
        );
      }

      await client.query(
        `
          UPDATE member_financial_entries
          SET
            status = 'contested',
            contested_at = NOW(),
            contest_reason = $1,
            updated_at = NOW()
          WHERE id = $2
        `,
        [
          reason,
          entry.id,
        ]
      );

      await client.query(
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
            'financial_entry_contested',
            'member_financial_entry',
            $2,
            $3::jsonb
          )
        `,
        [
          member.memberId,
          entry.id,
          JSON.stringify({
            reason,
            entryType:
              entry.entry_type,
          }),
        ]
      );

      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        message:
          "Votre contestation a été enregistrée et sera examinée par l’administration.",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(
      "Erreur de contestation financière :",
      error
    );

    return NextResponse.json(
      {
        error:
          "La contestation n’a pas pu être enregistrée.",
      },
      {
        status: 500,
      }
    );
  }
}
