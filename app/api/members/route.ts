import { NextResponse } from "next/server";
import { Pool } from "pg";
import nodemailer from "nodemailer";
import { resolve4 } from "dns/promises";

export const runtime = "nodejs";

const globalForDatabase = globalThis as unknown as { dambaPool?: Pool };

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL n'est pas configurée.");
  }

  if (!globalForDatabase.dambaPool) {
    globalForDatabase.dambaPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30_000,
    });
  }

  return globalForDatabase.dambaPool;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function ensureMembersTable(pool: Pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS membership_applications (
      id UUID PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      birth_date DATE NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      city TEXT NOT NULL,
      membership_type TEXT NOT NULL,
      emergency_name TEXT NOT NULL,
      emergency_phone TEXT NOT NULL,
      consent BOOLEAN NOT NULL,
      form_data JSONB NOT NULL
    )
  `);
}

async function sendNotification(member: Record<string, unknown>, id: string) {
  const requiredSettings = [
    process.env.SMTP_HOST,
    process.env.SMTP_USER,
    process.env.SMTP_PASS,
    process.env.NOTIFICATION_EMAIL,
  ];

  if (requiredSettings.some((setting) => !setting)) {
    console.warn("Notification e-mail ignorée : configuration SMTP incomplète.");
    return;
  }

  const smtpHost = process.env.SMTP_HOST as string;
  const [smtpIpv4] = await resolve4(smtpHost);

  const transporter = nodemailer.createTransport({
    host: smtpIpv4,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    tls: { servername: smtpHost },
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const fullName = `${clean(member.firstName)} ${clean(member.lastName)}`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.NOTIFICATION_EMAIL,
    subject: `Nouvelle demande d'adhésion — ${fullName}`,
    text: [
      "Une nouvelle demande d'adhésion a été enregistrée.",
      `Référence : ${id}`,
      `Nom : ${fullName}`,
      `E-mail : ${clean(member.email)}`,
      `Téléphone : ${clean(member.phone)}`,
      `Ville : ${clean(member.city)}`,
      `Type d'adhésion : ${clean(member.membershipType)}`,
    ].join("\n"),
    html: `
      <h2>Nouvelle demande d'adhésion</h2>
      <p><strong>Référence :</strong> ${escapeHtml(id)}</p>
      <p><strong>Nom :</strong> ${escapeHtml(fullName)}</p>
      <p><strong>E-mail :</strong> ${escapeHtml(member.email)}</p>
      <p><strong>Téléphone :</strong> ${escapeHtml(member.phone)}</p>
      <p><strong>Ville :</strong> ${escapeHtml(member.city)}</p>
      <p><strong>Type d'adhésion :</strong> ${escapeHtml(member.membershipType)}</p>
    `,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const required = [
      "firstName",
      "lastName",
      "birthDate",
      "email",
      "phone",
      "address",
      "postalCode",
      "city",
      "membershipType",
      "emergencyName",
      "emergencyPhone",
    ];

    for (const field of required) {
      if (!clean(body[field])) {
        return NextResponse.json(
          { error: `Le champ ${field} est obligatoire.` },
          { status: 400 },
        );
      }
    }

    if (!isValidEmail(clean(body.email))) {
      return NextResponse.json(
        { error: "Adresse e-mail invalide." },
        { status: 400 },
      );
    }

    if (body.consent !== true) {
      return NextResponse.json(
        { error: "Le consentement est obligatoire." },
        { status: 400 },
      );
    }

    const id = crypto.randomUUID();
    const pool = getPool();
    await ensureMembersTable(pool);

    await pool.query(
      `INSERT INTO membership_applications (
        id, first_name, last_name, birth_date, email, phone, address,
        postal_code, city, membership_type, emergency_name,
        emergency_phone, consent, form_data
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14::jsonb
      )`,
      [
        id,
        clean(body.firstName),
        clean(body.lastName),
        clean(body.birthDate),
        clean(body.email).toLowerCase(),
        clean(body.phone),
        clean(body.address),
        clean(body.postalCode),
        clean(body.city),
        clean(body.membershipType),
        clean(body.emergencyName),
        clean(body.emergencyPhone),
        true,
        JSON.stringify(body),
      ],
    );

    try {
      await sendNotification(body, id);
    } catch (emailError) {
      console.error("Inscription enregistrée, mais notification non envoyée.", emailError);
    }

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    console.error("Erreur d'enregistrement de l'adhésion :", error);
    return NextResponse.json(
      { error: "Impossible d’enregistrer la demande." },
      { status: 500 },
    );
  }
}
