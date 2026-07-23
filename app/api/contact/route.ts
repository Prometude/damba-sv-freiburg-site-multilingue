import nodemailer from "nodemailer";

export const runtime = "nodejs";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  website?: unknown;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim()
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    const website =
      typeof body.website === "string"
        ? body.website.trim()
        : "";

    // Champ invisible anti-spam
    if (website) {
      return Response.json({
        success: true,
      });
    }

    if (name.length < 2) {
      return Response.json(
        {
          error: "Veuillez indiquer un nom valide.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidEmail(email)) {
      return Response.json(
        {
          error:
            "Veuillez indiquer une adresse e-mail valide.",
        },
        {
          status: 400,
        }
      );
    }

    if (message.length < 10) {
      return Response.json(
        {
          error:
            "Le message doit contenir au moins 10 caractères.",
        },
        {
          status: 400,
        }
      );
    }

    if (message.length > 5000) {
      return Response.json(
        {
          error: "Le message est trop long.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASSWORD,
      SMTP_FROM,
    } = process.env;

    if (
      !SMTP_HOST ||
      !SMTP_PORT ||
      !SMTP_USER ||
      !SMTP_PASSWORD
    ) {
      console.error(
        "Configuration SMTP incomplète."
      );

      return Response.json(
        {
          error:
            "Le service de contact est temporairement indisponible.",
        },
        {
          status: 500,
        }
      );
    }

    const port = Number(SMTP_PORT);

    if (!Number.isInteger(port)) {
      return Response.json(
        {
          error: "Configuration SMTP incorrecte.",
        },
        {
          status: 500,
        }
      );
    }

    const transporter =
      nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure: port === 465,

        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD,
        },

        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
      });

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replaceAll(
      "\n",
      "<br />"
    );

    await transporter.sendMail({
      from:
        SMTP_FROM ||
        `"Damba SV Freiburg" <${SMTP_USER}>`,

      to: "infos@dambasv-freiburg.de",

      replyTo: email,

      subject: `Nouveau message du site – ${name}`,

      text: [
        "Nouveau message envoyé depuis le site Damba SV Freiburg",
        "",
        `Nom : ${name}`,
        `E-mail : ${email}`,
        "",
        "Message :",
        message,
      ].join("\n"),

      html: `
        <div
          style="
            max-width: 680px;
            margin: 0 auto;
            padding: 30px;
            font-family: Arial, sans-serif;
            color: #17241b;
          "
        >
          <h1
            style="
              margin: 0 0 22px;
              color: #08733b;
              font-size: 25px;
            "
          >
            Nouveau message du site Damba SV Freiburg
          </h1>

          <div
            style="
              padding: 20px;
              border: 1px solid #dfe8e2;
              border-radius: 14px;
              background: #f7faf8;
            "
          >
            <p>
              <strong>Nom :</strong>
              ${safeName}
            </p>

            <p>
              <strong>Adresse e-mail :</strong>
              ${safeEmail}
            </p>

            <p style="margin-bottom: 8px">
              <strong>Message :</strong>
            </p>

            <div
              style="
                padding: 16px;
                border-radius: 10px;
                background: #ffffff;
                line-height: 1.6;
              "
            >
              ${safeMessage}
            </div>
          </div>
        </div>
      `,
    });

    return Response.json({
      success: true,
      message:
        "Votre message a bien été envoyé.",
    });
  } catch (error) {
    console.error(
      "Erreur pendant l’envoi du message :",
      error
    );

    return Response.json(
      {
        error:
          "Le message n’a pas pu être envoyé. Veuillez réessayer.",
      },
      {
        status: 500,
      }
    );
  }
}
