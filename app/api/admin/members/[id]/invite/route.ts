import { NextResponse } from "next/server";

import {
  getDatabasePool,
} from "../../../../../../lib/database";

import {
  createSecureToken,
  hashToken,
  isFinanciallyEligible,
} from "../../../../../../lib/member-auth";

import {
  escapeHtml,
  getMailFrom,
  getMailTransporter,
} from "../../../../../../lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type MemberRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  application_status: string;
  membership_status: string;
  contribution_status: string;
  member_number: string | null;
};

export async function POST(
  request: Request,
  context: RouteContext
) {
  const pool = getDatabasePool();
  const { id } = await context.params;

  try {
    const result =
      await pool.query<MemberRow>(
        `
          SELECT
            id,
            first_name,
            last_name,
            email,
            application_status,
            membership_status,
            contribution_status,
            member_number
          FROM membership_applications
          WHERE id = $1
          LIMIT 1
        `,
        [id]
      );

    const member = result.rows[0];

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

    if (
      member.application_status !==
      "approved"
    ) {
      return NextResponse.json(
        {
          error:
            "L’adhésion doit être acceptée avant l’envoi de l’invitation.",
        },
        {
          status: 400,
        }
      );
    }

    if (!member.member_number) {
      return NextResponse.json(
        {
          error:
            "Aucun numéro de membre n’a été attribué.",
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
            "Le membre n’est pas encore en règle financièrement.",
        },
        {
          status: 400,
        }
      );
    }

    await pool.query("BEGIN");

    try {
      const accountResult =
        await pool.query<{
          id: string;
        }>(
          `
            INSERT INTO member_accounts (
              member_id,
              email
            )
            VALUES ($1, $2)
            ON CONFLICT (member_id)
            DO UPDATE SET
              email = EXCLUDED.email,
              updated_at = NOW()
            RETURNING id
          `,
          [
            member.id,
            member.email.toLowerCase(),
          ]
        );

      const accountId =
        accountResult.rows[0].id;

      await pool.query(
        `
          UPDATE member_auth_tokens
          SET used_at = NOW()
          WHERE member_account_id = $1
            AND token_type =
              'account_activation'
            AND used_at IS NULL
        `,
        [accountId]
      );

      const rawToken =
        createSecureToken();

      const tokenHash =
        hashToken(rawToken);

      await pool.query(
        `
          INSERT INTO member_auth_tokens (
            member_account_id,
            token_type,
            token_hash,
            expires_at,
            created_by
          )
          VALUES (
            $1,
            'account_activation',
            $2,
            NOW() + INTERVAL '48 hours',
            $3
          )
        `,
        [
          accountId,
          tokenHash,
          process.env.ADMIN_USERNAME ||
            "Administrateur Damba",
        ]
      );

      await pool.query(
        `
          UPDATE membership_applications
          SET
            account_access_status = 'invited'
          WHERE id = $1
        `,
        [member.id]
      );

      const forwardedHost =
        request.headers.get("x-forwarded-host");

      const forwardedProto =
        request.headers.get("x-forwarded-proto") ||
        "https";

      const baseUrl =
        process.env.APP_URL?.replace(/\/+$/, "") ||
        (forwardedHost
          ? `${forwardedProto}://${forwardedHost}`
          : "https://www.dambasv-freiburg.de");

      const activationUrl =
        `${baseUrl}/espace-membre/activation?token=${encodeURIComponent(
          rawToken
        )}`;

      const transporter =
        getMailTransporter();

      const safeName =
        escapeHtml(
          `${member.first_name} ${member.last_name}`
        );

      await transporter.sendMail({
        from: getMailFrom(),
        to: member.email,
        subject:
          "Activez votre espace membre – Damba SV Freiburg",
        text: [
          `Bonjour ${member.first_name},`,
          "",
          "Votre adhésion à Damba SV Freiburg a été validée.",
          `Numéro de membre : ${member.member_number}`,
          "",
          "Créez votre mot de passe en ouvrant le lien suivant :",
          activationUrl,
          "",
          "Ce lien est valable pendant 48 heures et ne peut être utilisé qu’une seule fois.",
          "",
          "Sportivement,",
          "Damba SV Freiburg",
        ].join("\n"),
        html: `
          <div style="
            max-width: 650px;
            margin: 0 auto;
            padding: 30px;
            font-family: Arial, sans-serif;
            color: #17241b;
          ">
            <h1 style="color:#08733b;">
              Activez votre espace membre
            </h1>

            <p>Bonjour ${safeName},</p>

            <p>
              Votre adhésion à Damba SV Freiburg
              a été validée.
            </p>

            <p>
              <strong>Numéro de membre :</strong>
              ${escapeHtml(member.member_number)}
            </p>

            <p style="margin:30px 0;">
              <a
                href="${activationUrl}"
                style="
                  display:inline-block;
                  padding:14px 22px;
                  border-radius:9px;
                  background:#08733b;
                  color:#ffffff;
                  font-weight:bold;
                  text-decoration:none;
                "
              >
                Créer mon mot de passe
              </a>
            </p>

            <p>
              Ce lien est valable pendant 48 heures
              et ne peut être utilisé qu’une seule fois.
            </p>

            <p>
              Sportivement,<br />
              <strong>Damba SV Freiburg</strong>
            </p>
          </div>
        `,
      });

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
            'admin',
            $1,
            'member_invitation_sent',
            'membership_application',
            $2,
            $3::jsonb
          )
        `,
        [
          process.env.ADMIN_USERNAME ||
            "Administrateur Damba",
          member.id,
          JSON.stringify({
            email: member.email,
            memberNumber:
              member.member_number,
          }),
        ]
      );

      await pool.query("COMMIT");

      return NextResponse.json({
        success: true,
        message:
          "L’invitation de création du mot de passe a été envoyée.",
      });
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error(
      "Erreur d’envoi de l’invitation membre :",
      error
    );

    return NextResponse.json(
      {
        error:
          "L’invitation n’a pas pu être envoyée.",
      },
      {
        status: 500,
      }
    );
  }
}
