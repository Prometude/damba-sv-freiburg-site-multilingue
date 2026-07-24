import Link from "next/link";
import AdminMemberFinance from
  "../../../../components/AdminMemberFinance";
import {
  notFound,
} from "next/navigation";

import {
  getDatabasePool,
} from "../../../../lib/database";

import AdminMemberActions from
  "../../../../components/AdminMemberActions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

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
  application_status: string;
  membership_status: string;
  member_role: string;
  contribution_status: string;
  contribution_valid_until:
    | Date
    | string
    | null;
  account_access_status: string;
  member_number: string | null;
  rejection_reason: string | null;
  suspension_reason: string | null;
};
type FinancialEntry = {
  id: string;
  entry_type: string;
  title: string;
  amount_cents: number;
  currency: string;
  status: string;
  due_date: Date | string | null;
  contest_reason: string | null;
  contested_at: Date | string | null;
  paid_cents: number;
  remaining_cents: number;
};

type Payment = {
  id: string;
  amount_cents: number;
  currency: string;
  payment_method: string;
  receipt_number: string | null;
  payment_date: Date | string;
  entry_title: string | null;
};

function formatDate(
  value: Date | string | null
) {
  if (!value) {
    return "Non définie";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle: "long",
      timeZone: "Europe/Berlin",
    }
  ).format(new Date(value));
}

export default async function AdminMemberPage({
  params,
}: PageProps) {
  const { id } = await params;
  const pool = getDatabasePool();

  const result =
    await pool.query<Member>(
      `
        SELECT
          id,
          created_at,
          first_name,
          last_name,
          birth_date,
          email,
          phone,
          address,
          postal_code,
          city,
          membership_type,
          emergency_name,
          emergency_phone,
          application_status,
          membership_status,
          member_role,
          contribution_status,
          contribution_valid_until,
          account_access_status,
          member_number,
          rejection_reason,
          suspension_reason
        FROM membership_applications
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

  const member = result.rows[0];

  if (!member) {
    notFound();
  }
  const entriesResult =
    await pool.query<FinancialEntry>(
      `
        SELECT
          e.id,
          e.entry_type,
          e.title,
          e.amount_cents,
          e.currency,
          e.status,
          e.due_date,
          e.contest_reason,
          e.contested_at,

          COALESCE(
            SUM(p.amount_cents),
            0
          )::integer AS paid_cents,

          GREATEST(
            e.amount_cents -
            COALESCE(
              SUM(p.amount_cents),
              0
            ),
            0
          )::integer AS remaining_cents

        FROM member_financial_entries e

        LEFT JOIN member_payments p
          ON p.financial_entry_id = e.id

        WHERE e.member_id = $1

        GROUP BY e.id

        ORDER BY e.created_at DESC
      `,
      [member.id]
    );

  const paymentsResult =
    await pool.query<Payment>(
      `
        SELECT
          p.id,
          p.amount_cents,
          p.currency,
          p.payment_method,
          p.receipt_number,
          p.payment_date,
          e.title AS entry_title
        FROM member_payments p

        LEFT JOIN member_financial_entries e
          ON e.id =
            p.financial_entry_id

        WHERE p.member_id = $1

        ORDER BY p.payment_date DESC
      `,
      [member.id]
    );


  return (
    <main className="admin-member-page">
      <div className="admin-member-header">
        <div>
          <Link href="/admin">
            ← Retour aux demandes
          </Link>

          <p>Fiche administrative</p>

          <h1>
            {member.first_name}{" "}
            {member.last_name}
          </h1>

          <strong>
            {member.member_number ||
              "Numéro non attribué"}
          </strong>
        </div>
      </div>

      <section className="admin-member-information">
        <article>
          <h2>Identité</h2>
          <p>
            <strong>Date de naissance :</strong>{" "}
            {formatDate(member.birth_date)}
          </p>
          <p>
            <strong>Type d’adhésion :</strong>{" "}
            {member.membership_type}
          </p>
          <p>
            <strong>Demande reçue :</strong>{" "}
            {formatDate(member.created_at)}
          </p>
        </article>

        <article>
          <h2>Coordonnées</h2>
          <p>
            <strong>E-mail :</strong>{" "}
            <a href={`mailto:${member.email}`}>
              {member.email}
            </a>
          </p>
          <p>
            <strong>Téléphone :</strong>{" "}
            <a href={`tel:${member.phone}`}>
              {member.phone}
            </a>
          </p>
          <p>
            <strong>Adresse :</strong><br />
            {member.address}<br />
            {member.postal_code}{" "}
            {member.city}
          </p>
        </article>

        <article>
          <h2>Contact d’urgence</h2>
          <p>{member.emergency_name}</p>
          <p>
            <a
              href={`tel:${member.emergency_phone}`}
            >
              {member.emergency_phone}
            </a>
          </p>
        </article>

        <article>
          <h2>Situation financière</h2>
          <p>
            <strong>Cotisation :</strong>{" "}
            {member.contribution_status}
          </p>
          <p>
            <strong>Valable jusqu’au :</strong>{" "}
            {formatDate(
              member.contribution_valid_until
            )}
          </p>
        </article>
      </section>

      {member.rejection_reason && (
        <div className="admin-member-warning">
          <strong>Motif de refus :</strong>{" "}
          {member.rejection_reason}
        </div>
      )}

      {member.suspension_reason && (
        <div className="admin-member-warning">
          <strong>
            Motif de suspension :
          </strong>{" "}
          {member.suspension_reason}
        </div>
      )}

      <AdminMemberActions
        memberId={member.id}
        memberNumber={
          member.member_number
        }
        role={member.member_role}
        contributionStatus={
          member.contribution_status
        }
        applicationStatus={
          member.application_status
        }
        membershipStatus={
          member.membership_status
        }
        accessStatus={
          member.account_access_status
        }
      />
      <AdminMemberFinance
        memberId={member.id}
        entries={entriesResult.rows.map(
          (entry) => ({
            id: entry.id,
            entryType:
              entry.entry_type,
            title: entry.title,
            amountCents:
              entry.amount_cents,
            currency:
              entry.currency,
            status:
              entry.status,
            dueDate:
              entry.due_date
                ? new Date(
                    entry.due_date
                  ).toISOString()
                : null,
            contestReason:
              entry.contest_reason,
            contestedAt:
              entry.contested_at
                ? new Date(
                    entry.contested_at
                  ).toISOString()
                : null,
            paidCents:
              entry.paid_cents,
            remainingCents:
              entry.remaining_cents,
          })
        )}
        payments={paymentsResult.rows.map(
          (payment) => ({
            id: payment.id,
            amountCents:
              payment.amount_cents,
            currency:
              payment.currency,
            paymentMethod:
              payment.payment_method,
            receiptNumber:
              payment.receipt_number,
            paymentDate:
              new Date(
                payment.payment_date
              ).toISOString(),
            entryTitle:
              payment.entry_title,
          })
        )}
      />
    </main>
  );
}
