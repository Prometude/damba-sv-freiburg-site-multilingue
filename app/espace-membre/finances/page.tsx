import Link from "next/link";

import {
  redirect,
} from "next/navigation";

import MemberFinancialActions from
  "../../../components/MemberFinancialActions";

import {
  getDatabasePool,
} from "../../../lib/database";

import {
  getCurrentMember,
} from "../../../lib/member-session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type FinancialEntry = {
  id: string;
  entry_type: string;
  title: string;
  description: string | null;
  amount_cents: number;
  currency: string;
  status: string;
  due_date: Date | string | null;
  paid_at: Date | string | null;
  contested_at: Date | string | null;
  contest_reason: string | null;
  decision_reference: string | null;
  regulatory_basis: string | null;
  document_url: string | null;
  created_at: Date | string;
  paid_cents: number;
  remaining_cents: number;
};

type Payment = {
  id: string;
  financial_entry_id: string | null;
  amount_cents: number;
  currency: string;
  payment_method: string;
  payment_reference: string | null;
  receipt_number: string | null;
  payment_date: Date | string;
  notes: string | null;
  entry_title: string | null;
};

const entryTypeLabels:
  Record<string, string> = {
    contribution: "Cotisation",
    sanction: "Sanction financière",
    damage_reimbursement:
      "Remboursement de dommage",
    equipment: "Équipement",
    event_fee: "Frais d’activité",
    credit: "Avoir",
    refund: "Remboursement",
    other: "Autre écriture",
  };

const statusLabels:
  Record<string, string> = {
    pending: "À payer",
    partially_paid:
      "Partiellement payé",
    paid: "Payé",
    overdue: "En retard",
    contested: "Contesté",
    cancelled: "Annulé",
  };

const paymentMethodLabels:
  Record<string, string> = {
    cash: "Espèces",
    bank_transfer:
      "Virement bancaire",
    card: "Carte bancaire",
    paypal: "PayPal",
    mobile_money: "Mobile Money",
    other: "Autre",
  };

function formatMoney(
  amountCents: number,
  currency = "EUR"
) {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency,
    }
  ).format(amountCents / 100);
}

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

function getStatusClass(
  status: string
) {
  return `member-finance-status member-finance-status-${status}`;
}

export default async function MemberFinancesPage() {
  const member =
    await getCurrentMember();

  if (!member) {
    redirect(
      "/espace-membre/connexion"
    );
  }

  const pool =
    getDatabasePool();

  const entriesResult =
    await pool.query<FinancialEntry>(
      `
        SELECT
          e.id,
          e.entry_type,
          e.title,
          e.description,
          e.amount_cents,
          e.currency,
          e.status,
          e.due_date,
          e.paid_at,
          e.contested_at,
          e.contest_reason,
          e.decision_reference,
          e.regulatory_basis,
          e.document_url,
          e.created_at,

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

        ORDER BY
          CASE
            WHEN e.status = 'overdue'
              THEN 1
            WHEN e.status = 'contested'
              THEN 2
            WHEN e.status = 'pending'
              THEN 3
            WHEN e.status =
              'partially_paid'
              THEN 4
            ELSE 5
          END,
          e.due_date ASC NULLS LAST,
          e.created_at DESC
      `,
      [member.memberId]
    );

  const paymentsResult =
    await pool.query<Payment>(
      `
        SELECT
          p.id,
          p.financial_entry_id,
          p.amount_cents,
          p.currency,
          p.payment_method,
          p.payment_reference,
          p.receipt_number,
          p.payment_date,
          p.notes,
          e.title AS entry_title
        FROM member_payments p
        LEFT JOIN member_financial_entries e
          ON e.id =
            p.financial_entry_id
        WHERE p.member_id = $1
        ORDER BY p.payment_date DESC
      `,
      [member.memberId]
    );

  const entries =
    entriesResult.rows;

  const payments =
    paymentsResult.rows;

  const debitEntries =
    entries.filter(
      (entry) =>
        ![
          "credit",
          "refund",
        ].includes(entry.entry_type) &&
        entry.status !== "cancelled"
    );

  const creditEntries =
    entries.filter(
      (entry) =>
        [
          "credit",
          "refund",
        ].includes(entry.entry_type) &&
        entry.status !== "cancelled"
    );

  const totalCharges =
    debitEntries.reduce(
      (total, entry) =>
        total + entry.amount_cents,
      0
    );

  const totalCredits =
    creditEntries.reduce(
      (total, entry) =>
        total + entry.amount_cents,
      0
    );

  const totalPayments =
    payments.reduce(
      (total, payment) =>
        total + payment.amount_cents,
      0
    );

  const outstandingBalance =
    Math.max(
      totalCharges -
        totalPayments -
        totalCredits,
      0
    );

  const contributionBalance =
    entries
      .filter(
        (entry) =>
          entry.entry_type ===
            "contribution" &&
          entry.status !== "cancelled"
      )
      .reduce(
        (total, entry) =>
          total +
          entry.remaining_cents,
        0
      );

  const sanctionBalance =
    entries
      .filter(
        (entry) =>
          [
            "sanction",
            "damage_reimbursement",
          ].includes(
            entry.entry_type
          ) &&
          entry.status !== "cancelled"
      )
      .reduce(
        (total, entry) =>
          total +
          entry.remaining_cents,
        0
      );

  return (
    <main className="member-finances-page">
      <header className="member-finances-header">
        <div>
          <Link href="/espace-membre">
            ← Retour au tableau de bord
          </Link>

          <span>Situation personnelle</span>

          <h1>Mes finances</h1>

          <p>
            Consultez vos cotisations,
            sanctions, frais, paiements
            et reçus.
          </p>
        </div>

        <div className="member-finances-member">
          <strong>
            {member.firstName}{" "}
            {member.lastName}
          </strong>

          <small>
            {member.memberNumber ||
              "Numéro non attribué"}
          </small>
        </div>
      </header>

      <section className="member-finance-summary-grid">
        <article>
          <span>Solde total restant</span>
          <strong>
            {formatMoney(
              outstandingBalance
            )}
          </strong>
        </article>

        <article>
          <span>Cotisations restantes</span>
          <strong>
            {formatMoney(
              contributionBalance
            )}
          </strong>
        </article>

        <article>
          <span>
            Sanctions et dommages
          </span>
          <strong>
            {formatMoney(
              sanctionBalance
            )}
          </strong>
        </article>

        <article>
          <span>Total déjà payé</span>
          <strong>
            {formatMoney(totalPayments)}
          </strong>
        </article>
      </section>

      <section className="member-finance-section">
        <div className="member-finance-section-heading">
          <div>
            <span>Détail du compte</span>
            <h2>
              Écritures financières
            </h2>
          </div>

          <strong>
            {entries.length} écriture
            {entries.length !== 1
              ? "s"
              : ""}
          </strong>
        </div>

        <div className="member-finance-entry-list">
          {entries.map((entry) => (
            <article
              className="member-finance-entry"
              key={entry.id}
            >
              <div className="member-finance-entry-top">
                <div>
                  <span className="member-finance-entry-type">
                    {entryTypeLabels[
                      entry.entry_type
                    ] ||
                      entry.entry_type}
                  </span>

                  <h3>{entry.title}</h3>
                </div>

                <div className="member-finance-entry-amount">
                  <strong>
                    {formatMoney(
                      entry.amount_cents,
                      entry.currency
                    )}
                  </strong>

                  <span
                    className={getStatusClass(
                      entry.status
                    )}
                  >
                    {statusLabels[
                      entry.status
                    ] ||
                      entry.status}
                  </span>
                </div>
              </div>

              {entry.description && (
                <p>
                  {entry.description}
                </p>
              )}

              <div className="member-finance-entry-details">
                <div>
                  <span>Date</span>
                  <strong>
                    {formatDate(
                      entry.created_at
                    )}
                  </strong>
                </div>

                <div>
                  <span>Échéance</span>
                  <strong>
                    {formatDate(
                      entry.due_date
                    )}
                  </strong>
                </div>

                <div>
                  <span>Déjà payé</span>
                  <strong>
                    {formatMoney(
                      entry.paid_cents,
                      entry.currency
                    )}
                  </strong>
                </div>

                <div>
                  <span>Reste à payer</span>
                  <strong>
                    {formatMoney(
                      entry.remaining_cents,
                      entry.currency
                    )}
                  </strong>
                </div>
              </div>

              {entry.decision_reference && (
                <p className="member-finance-reference">
                  <strong>
                    Référence de décision :
                  </strong>{" "}
                  {entry.decision_reference}
                </p>
              )}

              {entry.regulatory_basis && (
                <p className="member-finance-reference">
                  <strong>
                    Base réglementaire :
                  </strong>{" "}
                  {entry.regulatory_basis}
                </p>
              )}

              {entry.document_url && (
                <a
                  href={entry.document_url}
                  target="_blank"
                  rel="noreferrer"
                  className="member-finance-document-link"
                >
                  Consulter le justificatif
                </a>
              )}

              {entry.status ===
                "contested" &&
                entry.contest_reason && (
                  <div className="member-finance-contestation">
                    <strong>
                      Contestation envoyée le{" "}
                      {formatDate(
                        entry.contested_at
                      )}
                    </strong>

                    <p>
                      {entry.contest_reason}
                    </p>
                  </div>
                )}

              <MemberFinancialActions
                entryId={entry.id}
                entryType={
                  entry.entry_type
                }
                currentStatus={
                  entry.status
                }
              />
            </article>
          ))}

          {entries.length === 0 && (
            <div className="member-finance-empty">
              Aucune écriture financière
              n’est enregistrée sur votre
              compte.
            </div>
          )}
        </div>
      </section>

      <section className="member-finance-section">
        <div className="member-finance-section-heading">
          <div>
            <span>Historique</span>
            <h2>Mes paiements</h2>
          </div>

          <strong>
            {payments.length} paiement
            {payments.length !== 1
              ? "s"
              : ""}
          </strong>
        </div>

        <div className="member-payment-table-wrapper">
          <table className="member-payment-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Objet</th>
                <th>Moyen</th>
                <th>Référence</th>
                <th>Montant</th>
                <th>Reçu</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    {formatDate(
                      payment.payment_date
                    )}
                  </td>

                  <td>
                    {payment.entry_title ||
                      "Paiement général"}
                  </td>

                  <td>
                    {paymentMethodLabels[
                      payment.payment_method
                    ] ||
                      payment.payment_method}
                  </td>

                  <td>
                    {payment.payment_reference ||
                      "—"}
                  </td>

                  <td>
                    <strong>
                      {formatMoney(
                        payment.amount_cents,
                        payment.currency
                      )}
                    </strong>
                  </td>

                  <td>
                    <Link
                      href={`/espace-membre/finances/recus/${payment.id}`}
                    >
                      {payment.receipt_number
                        ? `Reçu ${payment.receipt_number}`
                        : "Voir le reçu"}
                    </Link>
                  </td>
                </tr>
              ))}

              {payments.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="member-payment-empty"
                  >
                    Aucun paiement enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
