import { getDatabasePool } from "../../../../../lib/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CsvValue = string | number | boolean | Date | null | undefined;

function csvCell(value: CsvValue) {
  let text =
    value instanceof Date
      ? value.toISOString()
      : value === null || value === undefined
        ? ""
        : String(value);

  // Empêche Excel d’interpréter une donnée utilisateur comme une formule.
  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const pool = getDatabasePool();

  const result = await pool.query(`
    SELECT
      id, created_at, first_name, last_name, birth_date, email, phone,
      address, postal_code, city, membership_type,
      emergency_name, emergency_phone, consent
    FROM membership_applications
    ORDER BY created_at DESC
  `);

  const headers = [
    "Référence",
    "Date d'inscription",
    "Prénom",
    "Nom",
    "Date de naissance",
    "E-mail",
    "Téléphone",
    "Adresse",
    "Code postal",
    "Ville",
    "Type d'adhésion",
    "Contact d'urgence",
    "Téléphone d'urgence",
    "Consentement",
  ];

  const rows = result.rows.map((member) =>
    [
      member.id,
      member.created_at,
      member.first_name,
      member.last_name,
      member.birth_date,
      member.email,
      member.phone,
      member.address,
      member.postal_code,
      member.city,
      member.membership_type,
      member.emergency_name,
      member.emergency_phone,
      member.consent ? "Oui" : "Non",
    ]
      .map(csvCell)
      .join(";"),
  );

  const csv = `\uFEFF${[headers.map(csvCell).join(";"), ...rows].join("\r\n")}`;
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="adhesions-damba-${date}.csv"`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
