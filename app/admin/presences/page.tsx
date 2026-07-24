import Link from "next/link";

import {
  getDatabasePool,
} from "../../../lib/database";

import AdminAttendanceReview from
  "../../../components/AdminAttendanceReview";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Attendance = {
  id: string;
  training_date: Date | string;
  first_name: string;
  last_name: string;
  email: string | null;
  review_status:
    | "pending"
    | "approved"
    | "rejected"
    | "absent";
  rejection_reason: string | null;
  updated_at: Date | string;
};

function formatDate(
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

export default async function AdminAttendancePage() {
  const pool =
    getDatabasePool();

  const dateResult =
    await pool.query<{
      training_date: Date | string;
    }>(`
      SELECT training_date
      FROM training_attendance
      ORDER BY training_date DESC
      LIMIT 1
    `);

  const latestDate =
    dateResult.rows[0]
      ?.training_date;

  const result = latestDate
    ? await pool.query<Attendance>(
        `
          SELECT
            id,
            training_date,
            first_name,
            last_name,
            email,
            review_status,
            rejection_reason,
            updated_at
          FROM training_attendance
          WHERE training_date = $1
          ORDER BY
            CASE review_status
              WHEN 'pending' THEN 1
              WHEN 'approved' THEN 2
              WHEN 'rejected' THEN 3
              WHEN 'absent' THEN 4
            END,
            last_name ASC,
            first_name ASC
        `,
        [latestDate]
      )
    : {
        rows: [] as Attendance[],
      };

  const items =
    result.rows.map((item) => ({
      id: item.id,
      firstName:
        item.first_name,
      lastName:
        item.last_name,
      email:
        item.email,
      status:
        item.review_status,
      rejectionReason:
        item.rejection_reason,
      updatedAt:
        new Date(
          item.updated_at
        ).toISOString(),
    }));

  return (
    <main className="attendance-admin-page">
      <div className="attendance-admin-header">
        <div>
          <p>
            Administration sécurisée
          </p>

          <h1>
            Demandes de participation
          </h1>

          {latestDate && (
            <strong>
              {formatDate(latestDate)}
              {" · "}
              17 h 00 – 19 h 00
            </strong>
          )}
        </div>

        <Link href="/admin">
          Voir les adhésions
        </Link>
      </div>

      <AdminAttendanceReview
        items={items}
      />

      {!latestDate && (
        <div className="attendance-admin-empty">
          Aucune demande enregistrée.
        </div>
      )}
    </main>
  );
}
