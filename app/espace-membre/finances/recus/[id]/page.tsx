import Image from "next/image";
import Link from "next/link";

import {
  notFound,
  redirect,
} from "next/navigation";

import {
  getDatabasePool,
} from "../../../../../lib/database";

import {
  getCurrentMember,
} from "../../../../../lib/member-session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Receipt = {
  id: string;
  amount_cents: number;
  currency: string;
  payment_method: string;
  payment_reference: string | null;
  receipt_number: string | null;
  payment_date: Date | string;
  notes: string | null;
  entry_title: string | null;
  first_name: string;
  last_name: string;
  member_number: string | null;
};

function formatMoney(
  amountCents: number,
  currency: string
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
  value: Date | string
) {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Europe/Berlin",
    }
  ).format(new Date(value));
}

export default async function MemberReceiptPage({
  params,
}: PageProps) {
  const member =
    await getCurrentMember();

  if (!member) {
    redirect(
      "/espace-membre/connexion"
    );
  }

  const { id } = await params;
  const pool = getDatabasePool();

  const result =
    await pool.query<Receipt>(
      `
        SELECT
          p.id,
          p.amount_cents,
          p.currency,
          p.payment_method,
          p.payment_reference,
          p.receipt_number,
          p.payment_date,
          p.notes,
          e.title AS entry_title,
          m.first_name,
          m.last_name,
          m.member_number
        FROM member_payments p
        INNER JOIN membership_applications m
          ON m.id = p.member_id
        LEFT JOIN member_financial_entries e
          ON e.id =
            p.financial_entry_id
        WHERE p.id = $1
          AND p.member_id = $2
        LIMIT 1
      `,
      [
        id,
        member.memberId,
      ]
    );

  const receipt =
    result.rows[0];

  if (!receipt) {
    notFound();
  }

  return (
    <main className="member-receipt-page">
      <div className="member-receipt-toolbar">
        <Link href="/espace-membre/finances">
          ← Retour à mes finances
        </Link>

        <span>
          Pour enregistrer le reçu en PDF,
          utilisez la fonction
          « Imprimer » du navigateur.
        </span>
      </div>

      <article className="member-receipt">
        <header className="member-receipt-header">
          <Image
            src="/damba.png"
            alt="Damba SV Freiburg"
            width={95}
            height={95}
            priority
          />

          <div>
            <span>Damba SV Freiburg</span>
            <h1>Reçu de paiement</h1>

            <p>
              N°{" "}
              {receipt.receipt_number ||
                receipt.id
                  .slice(0, 8)
                  .toUpperCase()}
            </p>
          </div>
        </header>

        <section className="member-receipt-grid">
          <div>
            <span>Membre</span>
            <strong>
              {receipt.first_name}{" "}
              {receipt.last_name}
            </strong>
          </div>

          <div>
            <span>Numéro de membre</span>
            <strong>
              {receipt.member_number ||
                "Non attribué"}
            </strong>
          </div>

          <div>
            <span>Date du paiement</span>
            <strong>
              {formatDate(
                receipt.payment_date
              )}
            </strong>
          </div>

          <div>
            <span>Montant reçu</span>
            <strong>
              {formatMoney(
                receipt.amount_cents,
                receipt.currency
              )}
            </strong>
          </div>

          <div>
            <span>Objet</span>
            <strong>
              {receipt.entry_title ||
                "Paiement général"}
            </strong>
          </div>

          <div>
            <span>Référence</span>
            <strong>
              {receipt.payment_reference ||
                "Non renseignée"}
            </strong>
          </div>
        </section>

        {receipt.notes && (
          <section className="member-receipt-notes">
            <strong>Remarques</strong>
            <p>{receipt.notes}</p>
          </section>
        )}

        <footer className="member-receipt-footer">
          <p>
            Ce reçu atteste qu’un paiement
            a été enregistré dans le compte
            du membre.
          </p>

          <strong>
            Damba SV Freiburg
          </strong>
        </footer>
      </article>
    </main>
  );
}
