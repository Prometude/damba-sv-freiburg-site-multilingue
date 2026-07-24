import { NextResponse } from "next/server";

import {
  getDatabasePool,
} from "../../../../../lib/database";

import {
  escapeHtml,
  getMailFrom,
  getMailTransporter,
} from "../../../../../lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReviewPayload = {
  id?: unknown;
  decision?: unknown;
  reason?: unknown;
};

type AttendanceRow = {
  id: string;
  training_date: Date | string;
  first_name: string;
  last_name: string;
  email: string | null;
  guest_count: number;
  attendance_status: "present" | "absent";
};

function formatTrainingDate(
  value: Date | string
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Berlin",
    }
  ).format(new Date(value));
}

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as ReviewPayload;

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    const decision =
      body.decision === "approved" ||
      body.decision === "rejected"
        ? body.decision
        : "";

    const reason =
      typeof body.reason === "string"
        ? body.reason.trim().slice(0, 1000)
        : "";

    if (!id || !decision) {
      return NextResponse.json(
        {
          error:
            "Décision administrative incorrecte.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      decision === "rejected" &&
      reason.length < 5
    ) {
      return NextResponse.json(
        {
          error:
            "Le motif du refus est obligatoire.",
        },
        {
          status: 400,
        }
      );
    }

    const pool =
      getDatabasePool();

    const result =
      await pool.query<AttendanceRow>(
        `
          SELECT
            id,
            training_date,
            first_name,
            last_name,
            email,
            guest_count,
            attendance_status
          FROM training_attendance
          WHERE id = $1
          LIMIT 1
        `,
        [id]
      );

    const attendance =
      result.rows[0];

    if (!attendance) {
      return NextResponse.json(
        {
          error:
            "Demande introuvable.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      attendance.attendance_status !==
      "present"
    ) {
      return NextResponse.json(
        {
          error:
            "Une absence ne nécessite pas de validation.",
        },
        {
          status: 400,
        }
      );
    }

    if (!attendance.email) {
      return NextResponse.json(
        {
          error:
            "Cette demande ne contient aucune adresse e-mail.",
        },
        {
          status: 400,
        }
      );
    }

    const reviewer =
      process.env.ADMIN_USERNAME ||
      "Responsable Damba";

    await pool.query(
      `
        UPDATE training_attendance
        SET
          review_status = $1,
          rejection_reason = $2,
          reviewed_at = NOW(),
          reviewed_by = $3,
          notification_sent_at = NULL,
          updated_at = NOW()
        WHERE id = $4
      `,
      [
        decision,
        decision === "rejected"
          ? reason
          : null,
        reviewer,
        id,
      ]
    );

    const transporter =
      getMailTransporter();

    const trainingDate =
      formatTrainingDate(
        attendance.training_date
      );

    const approved =
      decision === "approved";

    const safeName =
      escapeHtml(
        `${attendance.first_name} ${attendance.last_name}`
      );

    const safeReason =
      escapeHtml(reason);

    await transporter.sendMail({
      from: getMailFrom(),
      to: attendance.email,
      subject: approved
        ? "Participation validée – Damba SV Freiburg"
        : "Participation non validée – Damba SV Freiburg",
      text: approved
        ? [
            `Bonjour ${attendance.first_name},`,
            "",
            `Votre participation à l’entraînement du ${trainingDate}, de 17 h 00 à 19 h 00, a été validée.`,
            "",
            attendance.guest_count > 0
              ? `Visiteurs autorisés : ${attendance.guest_count}.`
              : "Aucun visiteur déclaré.",
            "",
            "Lieu : Schönbergstadion, Wiesentalstraße 2, 79115 Freiburg im Breisgau.",
            "",
            "Sportivement,",
            "Damba SV Freiburg",
          ].join("\n")
        : [
            `Bonjour ${attendance.first_name},`,
            "",
            `Votre participation à l’entraînement du ${trainingDate}, de 17 h 00 à 19 h 00, n’a pas été validée.`,
            "",
            `Motif : ${reason}`,
            "",
            "Pour toute clarification, vous pouvez contacter Damba SV Freiburg.",
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
          <h1 style="
            color: ${approved
              ? "#08733b"
              : "#a12820"};
            font-size: 24px;
          ">
            ${approved
              ? "Participation validée"
              : "Participation non validée"}
          </h1>

          <p>Bonjour ${safeName},</p>

          <p>
            Votre participation à l’entraînement du
            <strong>${trainingDate}</strong>,
            de 17 h 00 à 19 h 00,
            ${approved
              ? "a été validée."
              : "n’a pas été validée."}
          </p>

          ${
            approved
              ? `
                <p>
                  <strong>Visiteurs déclarés :</strong>
                  ${attendance.guest_count}
                </p>

                <p>
                  <strong>Nombre total de personnes :</strong>
                  ${1 + attendance.guest_count}
                </p>

                <p>
                  <strong>Lieu :</strong><br />
                  Schönbergstadion<br />
                  Wiesentalstraße 2<br />
                  79115 Freiburg im Breisgau
                </p>
              `
              : `
                <div style="
                  padding: 16px;
                  border-radius: 10px;
                  background: #fff1f0;
                  color: #8f1d15;
                ">
                  <strong>Motif :</strong><br />
                  ${safeReason}
                </div>
              `
          }

          <p>
            Sportivement,<br />
            <strong>Damba SV Freiburg</strong>
          </p>
        </div>
      `,
    });

    await pool.query(
      `
        UPDATE training_attendance
        SET notification_sent_at = NOW()
        WHERE id = $1
      `,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: approved
        ? "Participation validée et e-mail envoyé."
        : "Participation refusée et e-mail envoyé.",
    });
  } catch (error) {
    console.error(
      "Erreur de traitement administratif :",
      error
    );

    return NextResponse.json(
      {
        error:
          "La décision n’a pas pu être entièrement traitée.",
      },
      {
        status: 500,
      }
    );
  }
}
