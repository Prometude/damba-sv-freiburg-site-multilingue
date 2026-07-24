"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

type FinancialEntry = {
  id: string;
  entryType: string;
  title: string;
  amountCents: number;
  currency: string;
  status: string;
  dueDate: string | null;
  contestReason: string | null;
  contestedAt: string | null;
  paidCents: number;
  remainingCents: number;
};

type Payment = {
  id: string;
  amountCents: number;
  currency: string;
  paymentMethod: string;
  receiptNumber: string | null;
  paymentDate: string;
  entryTitle: string | null;
};

type Props = {
  memberId: string;
  entries: FinancialEntry[];
  payments: Payment[];
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
    other: "Autre",
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
  value: string | null
) {
  if (!value) {
    return "Non définie";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      dateStyle: "short",
      timeZone: "Europe/Berlin",
    }
  ).format(new Date(value));
}

export default function AdminMemberFinance({
  memberId,
  entries,
  payments,
}: Props) {
  const router = useRouter();

  const [entryType, setEntryType] =
    useState("contribution");

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [dueDate, setDueDate] =
    useState("");

  const [
    decisionReference,
    setDecisionReference,
  ] = useState("");

  const [
    regulatoryBasis,
    setRegulatoryBasis,
  ] = useState("");

  const [
    financialEntryId,
    setFinancialEntryId,
  ] = useState("");

  const [
    paymentAmount,
    setPaymentAmount,
  ] = useState("");

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState("bank_transfer");

  const [
    paymentReference,
    setPaymentReference,
  ] = useState("");

  const [
    paymentNotes,
    setPaymentNotes,
  ] = useState("");

  const [
    contestResponse,
    setContestResponse,
  ] = useState("");

  const [loading, setLoading] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function callApi(
    action: string,
    payload: Record<string, unknown>
  ) {
    setMessage("");
    setError("");
    setLoading(action);

    try {
      const response = await fetch(
        `/api/admin/members/${memberId}/finances`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action,
            ...payload,
          }),
        }
      );

      const result =
        (await response.json()) as {
          message?: string;
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          result.error ||
            "L’opération a échoué."
        );
      }

      setMessage(
        result.message ||
          "Opération effectuée."
      );

      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading("");
    }
  }

  async function createEntry(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await callApi(
      "create_entry",
      {
        entryType,
        title,
        description,
        amount,
        dueDate,
        decisionReference,
        regulatoryBasis,
      }
    );

    setTitle("");
    setDescription("");
    setAmount("");
    setDueDate("");
    setDecisionReference("");
    setRegulatoryBasis("");
  }

  async function recordPayment(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    await callApi(
      "record_payment",
      {
        financialEntryId,
        paymentAmount,
        paymentMethod,
        paymentReference,
        paymentNotes,
      }
    );

    setPaymentAmount("");
    setPaymentReference("");
    setPaymentNotes("");
  }

  const payableEntries =
    entries.filter(
      (entry) =>
        [
          "pending",
          "partially_paid",
          "overdue",
          "contested",
        ].includes(entry.status) &&
        ![
          "credit",
          "refund",
        ].includes(entry.entryType)
    );

  return (
    <section className="admin-finance">
      <div className="admin-finance-heading">
        <div>
          <span>Gestion financière</span>
          <h2>
            Compte du membre
          </h2>
        </div>

        <strong>
          {entries.length} écriture
          {entries.length !== 1
            ? "s"
            : ""}
        </strong>
      </div>

      {message && (
        <div className="member-auth-alert member-auth-success">
          {message}
        </div>
      )}

      {error && (
        <div className="member-auth-alert member-auth-error">
          {error}
        </div>
      )}

      <div className="admin-finance-forms">
        <form
          className="admin-finance-panel"
          onSubmit={createEntry}
        >
          <h3>
            Ajouter une écriture
          </h3>

          <label>
            Type
            <select
              value={entryType}
              onChange={(event) =>
                setEntryType(
                  event.target.value
                )
              }
            >
              <option value="contribution">
                Cotisation
              </option>

              <option value="sanction">
                Sanction financière
              </option>

              <option value="damage_reimbursement">
                Remboursement de dommage
              </option>

              <option value="equipment">
                Équipement
              </option>

              <option value="event_fee">
                Frais d’activité
              </option>

              <option value="credit">
                Avoir
              </option>

              <option value="refund">
                Remboursement
              </option>

              <option value="other">
                Autre
              </option>
            </select>
          </label>

          <label>
            Intitulé
            <input
              type="text"
              value={title}
              required
              minLength={3}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
            />
          </label>

          <label>
            Description
            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
            />
          </label>

          <div className="admin-finance-two-columns">
            <label>
              Montant en euros
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                required
                onChange={(event) =>
                  setAmount(
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              Date d’échéance
              <input
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(
                    event.target.value
                  )
                }
              />
            </label>
          </div>

          <label>
            Référence de décision
            <input
              type="text"
              value={decisionReference}
              placeholder="Ex. COM-2026-015"
              onChange={(event) =>
                setDecisionReference(
                  event.target.value
                )
              }
            />
          </label>

          <label>
            Base réglementaire
            <textarea
              value={regulatoryBasis}
              placeholder="Article du règlement, décision du comité ou justification."
              onChange={(event) =>
                setRegulatoryBasis(
                  event.target.value
                )
              }
            />
          </label>

          <button
            type="submit"
            disabled={
              loading ===
              "create_entry"
            }
          >
            {loading ===
            "create_entry"
              ? "Enregistrement…"
              : "Ajouter l’écriture"}
          </button>
        </form>

        <form
          className="admin-finance-panel"
          onSubmit={recordPayment}
        >
          <h3>
            Enregistrer un paiement
          </h3>

          <label>
            Écriture concernée
            <select
              value={financialEntryId}
              onChange={(event) =>
                setFinancialEntryId(
                  event.target.value
                )
              }
            >
              <option value="">
                Paiement général
              </option>

              {payableEntries.map(
                (entry) => (
                  <option
                    value={entry.id}
                    key={entry.id}
                  >
                    {entry.title}
                    {" — "}
                    {formatMoney(
                      entry.remainingCents,
                      entry.currency
                    )}
                    {" restant"}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            Montant payé
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={paymentAmount}
              required
              onChange={(event) =>
                setPaymentAmount(
                  event.target.value
                )
              }
            />
          </label>

          <label>
            Moyen de paiement
            <select
              value={paymentMethod}
              onChange={(event) =>
                setPaymentMethod(
                  event.target.value
                )
              }
            >
              <option value="bank_transfer">
                Virement bancaire
              </option>

              <option value="cash">
                Espèces
              </option>

              <option value="card">
                Carte bancaire
              </option>

              <option value="paypal">
                PayPal
              </option>

              <option value="mobile_money">
                Mobile Money
              </option>

              <option value="other">
                Autre
              </option>
            </select>
          </label>

          <label>
            Référence du paiement
            <input
              type="text"
              value={paymentReference}
              placeholder="Référence bancaire ou transaction"
              onChange={(event) =>
                setPaymentReference(
                  event.target.value
                )
              }
            />
          </label>

          <label>
            Remarques
            <textarea
              value={paymentNotes}
              onChange={(event) =>
                setPaymentNotes(
                  event.target.value
                )
              }
            />
          </label>

          <button
            type="submit"
            disabled={
              loading ===
              "record_payment"
            }
          >
            {loading ===
            "record_payment"
              ? "Enregistrement…"
              : "Enregistrer le paiement"}
          </button>
        </form>
      </div>

      <section className="admin-finance-list">
        <h3>
          Écritures financières
        </h3>

        {entries.map((entry) => (
          <article
            className="admin-finance-entry"
            key={entry.id}
          >
            <div className="admin-finance-entry-top">
              <div>
                <span>
                  {entryTypeLabels[
                    entry.entryType
                  ] ||
                    entry.entryType}
                </span>

                <h4>
                  {entry.title}
                </h4>
              </div>

              <div>
                <strong>
                  {formatMoney(
                    entry.amountCents,
                    entry.currency
                  )}
                </strong>

                <small>
                  {statusLabels[
                    entry.status
                  ] ||
                    entry.status}
                </small>
              </div>
            </div>

            <div className="admin-finance-entry-details">
              <span>
                Échéance :{" "}
                {formatDate(
                  entry.dueDate
                )}
              </span>

              <span>
                Payé :{" "}
                {formatMoney(
                  entry.paidCents,
                  entry.currency
                )}
              </span>

              <span>
                Solde :{" "}
                {formatMoney(
                  entry.remainingCents,
                  entry.currency
                )}
              </span>
            </div>

            {entry.status ===
              "contested" && (
              <div className="admin-finance-contestation">
                <strong>
                  Contestation du membre
                </strong>

                <p>
                  {entry.contestReason ||
                    "Motif non renseigné"}
                </p>

                <textarea
                  value={contestResponse}
                  placeholder="Réponse administrative"
                  onChange={(event) =>
                    setContestResponse(
                      event.target.value
                    )
                  }
                />

                <div>
                  <button
                    type="button"
                    disabled={Boolean(
                      loading
                    )}
                    onClick={() =>
                      callApi(
                        "resolve_contestation",
                        {
                          financialEntryId:
                            entry.id,
                          contestDecision:
                            "accept",
                          contestResponse,
                        }
                      )
                    }
                  >
                    Accepter la contestation
                  </button>

                  <button
                    type="button"
                    className="admin-finance-danger"
                    disabled={Boolean(
                      loading
                    )}
                    onClick={() =>
                      callApi(
                        "resolve_contestation",
                        {
                          financialEntryId:
                            entry.id,
                          contestDecision:
                            "reject",
                          contestResponse,
                        }
                      )
                    }
                  >
                    Rejeter la contestation
                  </button>
                </div>
              </div>
            )}

            {![
              "paid",
              "cancelled",
            ].includes(entry.status) && (
              <button
                type="button"
                className="admin-finance-cancel"
                disabled={Boolean(
                  loading
                )}
                onClick={() => {
                  const confirmed =
                    window.confirm(
                      "Confirmer l’annulation de cette écriture financière ?"
                    );

                  if (confirmed) {
                    void callApi(
                      "cancel_entry",
                      {
                        financialEntryId:
                          entry.id,
                      }
                    );
                  }
                }}
              >
                Annuler cette écriture
              </button>
            )}
          </article>
        ))}

        {entries.length === 0 && (
          <p>
            Aucune écriture financière.
          </p>
        )}
      </section>

      <section className="admin-finance-list">
        <h3>Paiements enregistrés</h3>

        <div className="member-payment-table-wrapper">
          <table className="member-payment-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Objet</th>
                <th>Moyen</th>
                <th>Montant</th>
                <th>Reçu</th>
              </tr>
            </thead>

            <tbody>
              {payments.map(
                (payment) => (
                  <tr key={payment.id}>
                    <td>
                      {formatDate(
                        payment.paymentDate
                      )}
                    </td>

                    <td>
                      {payment.entryTitle ||
                        "Paiement général"}
                    </td>

                    <td>
                      {payment.paymentMethod}
                    </td>

                    <td>
                      <strong>
                        {formatMoney(
                          payment.amountCents,
                          payment.currency
                        )}
                      </strong>
                    </td>

                    <td>
                      {payment.receiptNumber ||
                        "—"}
                    </td>
                  </tr>
                )
              )}

              {payments.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    Aucun paiement enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
