import {
  NextResponse,
} from "next/server";

import {
  getDatabasePool,
} from "../../../../lib/database";

import {
  hashPassword,
  hashToken,
  isFinanciallyEligible,
  validatePassword,
} from "../../../../lib/member-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ActivationPayload = {
  token?: unknown;
  password?: unknown;
  passwordConfirmation?: unknown;
};

export async function POST(
  request: Request
) {
  const pool =
    getDatabasePool();

  try {
    const body =
      (await request.json()) as
        ActivationPayload;

    const token =
      typeof body.token === "string"
        ? body.token.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const passwordConfirmation =
      typeof body.passwordConfirmation ===
      "string"
        ? body.passwordConfirmation
        : "";

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Le lien d’activation est incomplet.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      password !==
      passwordConfirmation
    ) {
      return NextResponse.json(
        {
          error:
            "Les deux mots de passe ne correspondent pas.",
        },
        {
          status: 400,
        }
      );
    }

    const passwordValidation =
      validatePassword(password);

    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error:
            passwordValidation.error,
        },
        {
          status: 400,
        }
      );
    }

    const client =
      await pool.connect();

    try {
      await client.query("BEGIN");

      const result =
        await client.query<{
          token_id: string;
          account_id: string;
          member_id: string;
          application_status: string;
          contribution_status: string;
          account_access_status: string;
        }>(
          `
            SELECT
              t.id AS token_id,
              a.id AS account_id,
              m.id AS member_id,
              m.application_status,
              m.contribution_status,
              m.account_access_status
            FROM member_auth_tokens t
            INNER JOIN member_accounts a
              ON a.id =
                t.member_account_id
            INNER JOIN membership_applications m
              ON m.id = a.member_id
            WHERE
              t.token_hash = $1
              AND t.token_type =
                'account_activation'
              AND t.used_at IS NULL
              AND t.expires_at > NOW()
            FOR UPDATE
            LIMIT 1
          `,
          [hashToken(token)]
        );

      const activation =
        result.rows[0];

      if (!activation) {
        await client.query(
          "ROLLBACK"
        );

        return NextResponse.json(
          {
            error:
              "Ce lien d’activation est invalide, expiré ou déjà utilisé.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        activation.application_status !==
        "approved"
      ) {
        await client.query(
          "ROLLBACK"
        );

        return NextResponse.json(
          {
            error:
              "Cette adhésion n’est pas encore validée.",
          },
          {
            status: 403,
          }
        );
      }

      if (
        !isFinanciallyEligible(
          activation.contribution_status
        )
      ) {
        await client.query(
          "ROLLBACK"
        );

        return NextResponse.json(
          {
            error:
              "Votre situation financière doit être régularisée avant l’activation du compte.",
          },
          {
            status: 403,
          }
        );
      }

      const passwordHash =
        await hashPassword(password);

      await client.query(
        `
          UPDATE member_accounts
          SET
            password_hash = $1,
            password_algorithm =
              'scrypt',
            email_verified_at =
              COALESCE(
                email_verified_at,
                NOW()
              ),
            password_created_at =
              NOW(),
            failed_login_count = 0,
            locked_until = NULL,
            updated_at = NOW()
          WHERE id = $2
        `,
        [
          passwordHash,
          activation.account_id,
        ]
      );

      await client.query(
        `
          UPDATE member_auth_tokens
          SET used_at = NOW()
          WHERE id = $1
        `,
        [activation.token_id]
      );

      await client.query(
        `
          UPDATE membership_applications
          SET
            membership_status =
              'active',
            account_access_status =
              'active',
            suspended_at = NULL,
            suspension_reason = NULL
          WHERE id = $1
        `,
        [activation.member_id]
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
            'member_account_activated',
            'member_account',
            $2,
            '{}'::jsonb
          )
        `,
        [
          activation.member_id,
          activation.account_id,
        ]
      );

      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        message:
          "Votre compte a été activé. Vous pouvez maintenant vous connecter.",
      });
    } catch (error) {
      await client.query(
        "ROLLBACK"
      );

      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(
      "Erreur d’activation du compte membre :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Le compte n’a pas pu être activé.",
      },
      {
        status: 500,
      }
    );
  }
}
