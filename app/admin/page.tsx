import { getDatabasePool } from "../../lib/database";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Member = {
  id: string;
  created_at: Date | string;
  first_name: string;
  last_name: string;
  birth_date: Date | string;
  email: string;
  phone: string;
  address: string;
  postal_code: string;
  city: string;
  membership_type: string;
  emergency_name: string;
  emergency_phone: string;
};

function formatDate(value: Date | string, withTime = false) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    ...(withTime ? { timeStyle: "short" as const } : {}),
    timeZone: "Europe/Berlin",
  }).format(new Date(value));
}

export default async function AdminMembersPage() {
  const pool = getDatabasePool();

  const result = await pool.query<Member>(`
    SELECT
      id, created_at, first_name, last_name, birth_date, email, phone,
      address, postal_code, city, membership_type,
      emergency_name, emergency_phone
    FROM membership_applications
    ORDER BY created_at DESC
  `);

  const members = result.rows;

  return (
    <section
      style={{
        maxWidth: 1500,
        margin: "0 auto",
        padding: "40px 20px 80px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <p style={{ color: "#64748b", margin: "0 0 8px" }}>
            Administration sécurisée
          </p>
          <h1 style={{ margin: 0 }}>Demandes d’adhésion</h1>
          <p style={{ marginBottom: 0 }}>
            {members.length} demande{members.length !== 1 ? "s" : ""} enregistrée
            {members.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
        }}>
          <a
            href="/admin/presences"
            style={{
              display: "inline-block",
              padding: "12px 18px",
              borderRadius: 8,
              border: "1px solid #166534",
              color: "#166534",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Voir les présences
          </a>

          <a
          href="/api/admin/members/export"
          style={{
            display: "inline-block",
            padding: "12px 18px",
            borderRadius: 8,
            background: "#166534",
            color: "#fff",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Exporter en CSV
        </a>
        </div>
      </div>

      <div
        style={{
          overflowX: "auto",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          background: "#fff",
          boxShadow: "0 8px 25px rgba(15, 23, 42, 0.06)",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: 1250,
            borderCollapse: "collapse",
            fontSize: 14,
          }}
        >
          <thead style={{ background: "#f1f5f9", textAlign: "left" }}>
            <tr>
              {[
                "Date",
                "Nom",
                "Naissance",
                "Coordonnées",
                "Adresse",
                "Type",
                "Contact d’urgence",
                "Référence",
                "Gestion",
              ].map((title) => (
                <th
                  key={title}
                  style={{ padding: 14, borderBottom: "1px solid #cbd5e1" }}
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td style={{ padding: 14, borderBottom: "1px solid #e2e8f0" }}>
                  {formatDate(member.created_at, true)}
                </td>
                <td style={{ padding: 14, borderBottom: "1px solid #e2e8f0" }}>
                  <strong>
                    {member.first_name} {member.last_name}
                  </strong>
                </td>
                <td style={{ padding: 14, borderBottom: "1px solid #e2e8f0" }}>
                  {formatDate(member.birth_date)}
                </td>
                <td style={{ padding: 14, borderBottom: "1px solid #e2e8f0" }}>
                  <a href={`mailto:${member.email}`}>{member.email}</a>
                  <br />
                  <a href={`tel:${member.phone}`}>{member.phone}</a>
                </td>
                <td style={{ padding: 14, borderBottom: "1px solid #e2e8f0" }}>
                  {member.address}
                  <br />
                  {member.postal_code} {member.city}
                </td>
                <td style={{ padding: 14, borderBottom: "1px solid #e2e8f0" }}>
                  {member.membership_type}
                </td>
                <td style={{ padding: 14, borderBottom: "1px solid #e2e8f0" }}>
                  {member.emergency_name}
                  <br />
                  {member.emergency_phone}
                </td>
                <td
                  style={{
                    padding: 14,
                    borderBottom: "1px solid #e2e8f0",
                    fontFamily: "monospace",
                    fontSize: 12,
                  }}
                >
                  {member.id}
                </td>

                <td
                  style={{
                    padding: 14,
                    borderBottom:
                      "1px solid #e2e8f0",
                  }}
                >
                  <a
                    href={`/admin/membres/${member.id}`}
                    style={{
                      display: "inline-block",
                      padding: "9px 13px",
                      borderRadius: 7,
                      background: "#166534",
                      color: "#ffffff",
                      fontWeight: 700,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Gérer
                  </a>
                </td>
              </tr>
            ))}

            {members.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: 40, textAlign: "center" }}>
                  Aucune demande d’adhésion enregistrée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
