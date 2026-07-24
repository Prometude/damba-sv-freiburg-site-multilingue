import { NextResponse } from "next/server";

import {
  getDatabasePool,
} from "../../../../../../lib/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type RequestPayload = {
  action?: unknown;

  entryType?: unknown;
  title?: unknown;
  description?: unknown;
  amount?: unknown;
  dueDate?: unknown;
  decisionReference?: unknown;
  regulatoryBasis?: unknown;

  financialEntryId?: unknown;
  paymentAmount?: unknown;
  paymentMethod?: unknown;
  paymentReference?: unknown;
  paymentNotes?: unknown;

  contestDecision?: unknown;
  contestResponse?: unknown;
};

const entryTypes = [
  "contribution",
  "sanction",
  "damage_reimbursement",
  "equipment",
  "event_fee",
  "credit",
  "refund",
  "other",
];

const paymentMethods = [
  "cash",
  "bank_transfer",
  "card",
  "paypal",
  "mobile_money",
  "other",
];

function cleanText(
  value: unknown,
  maxLength = 2000
) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

function parseAmountToCents(
  value: unknown
) {
  const raw =
    typeof value === "number"
      ? String(value)
      : cleanText(value, 40);

  const normalized = raw
    .replace(/\s/g, "")
    .replace(",", ".");

  const amount = Number(normalized);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return null;
  }

  return Math.round(amount * 100);
}

function isValidDate(
  value: string
) {
  return (
    value === "" ||
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  );
}

async function generateReceiptNumber(
  client: {
    query: (
      text: string,
      values?: unknown[]
    ) => Promise<{
      rows: Array<{
        receipt_number?: string;
      }>;
    }>;
  }
) {
  await client.query(
    "SELECT pg_advisory_xact_lock(2026072501)"
  );

  const year =
    new Date().getFullYear();

  const result =
    await client.query(
      `
        SELECT receipt_number
        FROM member_payments
        WHERE receipt_number LIKE $1
        ORDER BY receipt_number DESC
        LIMIT 1
      `,
      [`DSV-REC-${year}-%`]
    );

  const lastReceipt =
    result.rows[0]?.receipt_number;

  const lastSequence = lastReceipt
    ? Number(
        lastReceipt.split("-").at(-1)
      )
    : 0;

  return `DSV-REC-${year}-${String(
    lastSequence + 1
  ).padStart(5, "0")}`;
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  const { id: memberId } =
    await context.params;

  const pool =
    getDatabasePool();

  const administrator =
    process.env.ADMIN_USERNAME ||
    "Administrateur Damba";

  try {
    const body =
      (await request.json()) as
        RequestPayload;

    const action =
      cleanText(body.action, 80);

    const memberResult =
      await pool.query<{
        id: string;
        first_name: string;
        last_name: string;
      }>(
        `
          SELECT
            id,
            first_name,
            last_name
          FROM membership_applications
          WHERE id = $1
          LIMIT 1
        `,
        [memberId]
      );

    const member =
      memberResult.rows[0];

    if (!member) {
      return NextResponse.json(
        {
          error: "Membre introuvable.",
        },
        {
          status: 404,
        }
      );
    }

    if (action === "create_entry") {
      const entryType =
        cleanText(
          body.entryType,
          80
        );

      const title =
        cleanText(body.title, 200);

      const description =
        cleanText(
          body.description,
          2000
        );

      const dueDate =
        cleanText(body.dueDate, 20);

      const decisionReference =
        cleanText(
          body.decisionReference,
          200
        );

      const regulatoryBasis =
        cleanText(
          body.regulatoryBasis,
          1000
        );

      const amountCents =
        parseAmountToCents(
          body.amount
        );

      if (
        !entryTypes.includes(entryType)
      ) {
        return NextResponse.json(
          {
            error:
              "Type d’écriture incorrect.",
          },
          {
            status: 400,
          }
        );
      }

      if (title.length < 3) {
        return NextResponse.json(
          {
            error:
              "Le titre doit contenir au moins 3 caractères.",
          },
          {
            status: 400,
          }
        );
      }

      if (!amountCents) {
        return NextResponse.json(
          {
            error:
              "Le montant doit être supérieur à zéro.",
          },
          {
            status: 400,
          }
        );
      }

      if (!isValidDate(dueDate)) {
        return NextResponse.json(
          {
            error:
              "La date d’échéance est incorrecte.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        [
          "sanction",
          "damage_reimbursement",
        ].includes(entryType) &&
        regulatoryBasis.length < 5
      ) {
        return NextResponse.json(
          {
            error:
              "Une base réglementaire est obligatoire pour une sanction ou un remboursement de dommage.",
          },
          {
            status: 400,
          }
        );
      }

      const client =
        await pool.connect();

      try {
        await client.query("BEGIN");

        const entryResult =
          await client.query<{
            id: string;
          }>(
            `
              INSERT INTO member_financial_entries (
                member_id,
                entry_type,
                title,
                description,
                amount_cents,
                currency,
                status,
                due_date,
                decision_reference,
                regulatory_basis,
                created_by
              )
              VALUES (
                $1,
                $2,
                $3,
                NULLIF($4, ''),
                $5,
                'EUR',
                'pending',
                NULLIF($6, '')::date,
                NULLIF($7, ''),
                NULLIF($8, ''),
                $9
              )
              RETURNING id
            `,
            [
              memberId,
              entryType,
              title,
              description,
              amountCents,
              dueDate,
              decisionReference,
              regulatoryBasis,
              administrator,
            ]
          );

        const entryId =
          entryResult.rows[0].id;

        await client.query(
          `
            INSERT INTO member_audit_logs (
              actor_type,
              actor_identifier,
              action,
              entity_type,
              entity_id,
              details
            )
            VALUES (
              'admin',
              $1,
              'financial_entry_created',
              'member_financial_entry',
              $2,
              $3::jsonb
            )
          `,
          [
            administrator,
            entryId,
            JSON.stringify({
              memberId,
              entryType,
              amountCents,
              title,
            }),
          ]
        );

        await client.query("COMMIT");

        return NextResponse.json({
          success: true,
          message:
            "L’écriture financière a été créée.",
        });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    if (action === "record_payment") {
      const financialEntryId =
        cleanText(
          body.financialEntryId,
          100
        );

      const paymentMethod =
        cleanText(
          body.paymentMethod,
          80
        );

      const paymentReference =
        cleanText(
          body.paymentReference,
          200
        );

      const paymentNotes =
        cleanText(
          body.paymentNotes,
          1000
        );

      const amountCents =
        parseAmountToCents(
          body.paymentAmount
        );

      if (
        !paymentMethods.includes(
          paymentMethod
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Moyen de paiement incorrect.",
          },
          {
            status: 400,
          }
        );
      }

      if (!amountCents) {
        return NextResponse.json(
          {
            error:
              "Le montant du paiement doit être supérieur à zéro.",
          },
          {
            status: 400,
          }
        );
      }

      const client =
        await pool.connect();

      try {
        await client.query("BEGIN");

        let entry:
          | {
              id: string;
              amount_cents: number;
              status: string;
              entry_type: string;
            }
          | undefined;

        if (financialEntryId) {
          const entryResult =
            await client.query<{
              id: string;
              amount_cents: number;
              status: string;
              entry_type: string;
            }>(
              `
                SELECT
                  id,
                  amount_cents,
                  status,
                  entry_type
                FROM member_financial_entries
                WHERE id = $1
                  AND member_id = $2
                FOR UPDATE
                LIMIT 1
              `,
              [
                financialEntryId,
                memberId,
              ]
            );

          entry =
            entryResult.rows[0];

          if (!entry) {
            await client.query(
              "ROLLBACK"
            );

            return NextResponse.json(
              {
                error:
                  "Écriture financière introuvable.",
              },
              {
                status: 404,
              }
            );
          }

          if (
            [
              "cancelled",
              "paid",
            ].includes(entry.status)
          ) {
            await client.query(
              "ROLLBACK"
            );

            return NextResponse.json(
              {
                error:
                  "Cette écriture ne peut plus recevoir de paiement.",
              },
              {
                status: 400,
              }
            );
          }

          if (
            [
              "credit",
              "refund",
            ].includes(
              entry.entry_type
            )
          ) {
            await client.query(
              "ROLLBACK"
            );

            return NextResponse.json(
              {
                error:
                  "Un paiement ne peut pas être affecté à un avoir ou à un remboursement.",
              },
              {
                status: 400,
              }
            );
          }

          const alreadyPaidResult =
            await client.query<{
              total_paid: string;
            }>(
              `
                SELECT
                  COALESCE(
                    SUM(amount_cents),
                    0
                  )::text AS total_paid
                FROM member_payments
                WHERE financial_entry_id = $1
              `,
              [entry.id]
            );

          const alreadyPaid =
            Number(
              alreadyPaidResult
                .rows[0]
                ?.total_paid || 0
            );

          const remaining =
            Math.max(
              entry.amount_cents -
                alreadyPaid,
              0
            );

          if (amountCents > remaining) {
            await client.query(
              "ROLLBACK"
            );

            return NextResponse.json(
              {
                error:
                  `Le paiement dépasse le solde restant de ${(remaining / 100).toFixed(2)} €.`,
              },
              {
                status: 400,
              }
            );
          }
        }

        const receiptNumber =
          await generateReceiptNumber(
            client
          );

        const paymentResult =
          await client.query<{
            id: string;
          }>(
            `
              INSERT INTO member_payments (
                member_id,
                financial_entry_id,
                amount_cents,
                currency,
                payment_method,
                payment_reference,
                receipt_number,
                payment_date,
                recorded_by,
                notes
              )
              VALUES (
                $1,
                NULLIF($2, '')::uuid,
                $3,
                'EUR',
                $4,
                NULLIF($5, ''),
                $6,
                NOW(),
                $7,
                NULLIF($8, '')
              )
              RETURNING id
            `,
            [
              memberId,
              financialEntryId,
              amountCents,
              paymentMethod,
              paymentReference,
              receiptNumber,
              administrator,
              paymentNotes,
            ]
          );

        const paymentId =
          paymentResult.rows[0].id;

        if (entry) {
          const totalsResult =
            await client.query<{
              total_paid: string;
            }>(
              `
                SELECT
                  COALESCE(
                    SUM(amount_cents),
                    0
                  )::text AS total_paid
                FROM member_payments
                WHERE financial_entry_id = $1
              `,
              [entry.id]
            );

          const totalPaid =
            Number(
              totalsResult.rows[0]
                ?.total_paid || 0
            );

          const newStatus =
            totalPaid >=
            entry.amount_cents
              ? "paid"
              : "partially_paid";

          await client.query(
            `
              UPDATE member_financial_entries
              SET
                status = $1,
                paid_at =
                  CASE
                    WHEN $1 = 'paid'
                      THEN NOW()
                    ELSE NULL
                  END,
                updated_at = NOW()
              WHERE id = $2
            `,
            [
              newStatus,
              entry.id,
            ]
          );
        }

        await client.query(
          `
            INSERT INTO member_audit_logs (
              actor_type,
              actor_identifier,
              action,
              entity_type,
              entity_id,
              details
            )
            VALUES (
              'admin',
              $1,
              'member_payment_recorded',
              'member_payment',
              $2,
              $3::jsonb
            )
          `,
          [
            administrator,
            paymentId,
            JSON.stringify({
              memberId,
              financialEntryId:
                financialEntryId ||
                null,
              amountCents,
              receiptNumber,
            }),
          ]
        );

        await client.query("COMMIT");

        return NextResponse.json({
          success: true,
          message:
            `Paiement enregistré. Reçu : ${receiptNumber}`,
          receiptNumber,
          paymentId,
        });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    if (
      action === "resolve_contestation"
    ) {
      const financialEntryId =
        cleanText(
          body.financialEntryId,
          100
        );

      const contestDecision =
        cleanText(
          body.contestDecision,
          30
        );

      const contestResponse =
        cleanText(
          body.contestResponse,
          2000
        );

      if (
        ![
          "accept",
          "reject",
        ].includes(contestDecision)
      ) {
        return NextResponse.json(
          {
            error:
              "Décision de contestation incorrecte.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        contestResponse.length < 5
      ) {
        return NextResponse.json(
          {
            error:
              "Une réponse administrative est obligatoire.",
          },
          {
            status: 400,
          }
        );
      }

      const client =
        await pool.connect();

      try {
        await client.query("BEGIN");

        const entryResult =
          await client.query<{
            id: string;
            status: string;
            contest_reason: string | null;
          }>(
            `
              SELECT
                id,
                status,
                contest_reason
              FROM member_financial_entries
              WHERE id = $1
                AND member_id = $2
              FOR UPDATE
              LIMIT 1
            `,
            [
              financialEntryId,
              memberId,
            ]
          );

        const entry =
          entryResult.rows[0];

        if (!entry) {
          await client.query(
            "ROLLBACK"
          );

          return NextResponse.json(
            {
              error:
                "Écriture financière introuvable.",
            },
            {
              status: 404,
            }
          );
        }

        if (
          entry.status !== "contested"
        ) {
          await client.query(
            "ROLLBACK"
          );

          return NextResponse.json(
            {
              error:
                "Cette écriture ne possède pas de contestation en cours.",
            },
            {
              status: 400,
            }
          );
        }

        if (
          contestDecision ===
          "accept"
        ) {
          await client.query(
            `
              UPDATE member_financial_entries
              SET
                status = 'cancelled',
                cancelled_at = NOW(),
                updated_at = NOW()
              WHERE id = $1
            `,
            [entry.id]
          );
        } else {
          const paymentResult =
            await client.query<{
              total_paid: string;
            }>(
              `
                SELECT
                  COALESCE(
                    SUM(amount_cents),
                    0
                  )::text AS total_paid
                FROM member_payments
                WHERE financial_entry_id = $1
              `,
              [entry.id]
            );

          const totalPaid =
            Number(
              paymentResult.rows[0]
                ?.total_paid || 0
            );

          const status =
            totalPaid > 0
              ? "partially_paid"
              : "pending";

          await client.query(
            `
              UPDATE member_financial_entries
              SET
                status = $1,
                updated_at = NOW()
              WHERE id = $2
            `,
            [
              status,
              entry.id,
            ]
          );
        }

        await client.query(
          `
            INSERT INTO member_audit_logs (
              actor_type,
              actor_identifier,
              action,
              entity_type,
              entity_id,
              details
            )
            VALUES (
              'admin',
              $1,
              'financial_contestation_resolved',
              'member_financial_entry',
              $2,
              $3::jsonb
            )
          `,
          [
            administrator,
            entry.id,
            JSON.stringify({
              decision:
                contestDecision,
              response:
                contestResponse,
              memberReason:
                entry.contest_reason,
            }),
          ]
        );

        await client.query("COMMIT");

        return NextResponse.json({
          success: true,
          message:
            contestDecision ===
            "accept"
              ? "La contestation a été acceptée et l’écriture annulée."
              : "La contestation a été rejetée et l’écriture réactivée.",
        });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    if (action === "cancel_entry") {
      const financialEntryId =
        cleanText(
          body.financialEntryId,
          100
        );

      const client =
        await pool.connect();

      try {
        await client.query("BEGIN");

        const entryResult =
          await client.query<{
            id: string;
            status: string;
          }>(
            `
              SELECT
                id,
                status
              FROM member_financial_entries
              WHERE id = $1
                AND member_id = $2
              FOR UPDATE
              LIMIT 1
            `,
            [
              financialEntryId,
              memberId,
            ]
          );

        const entry =
          entryResult.rows[0];

        if (!entry) {
          await client.query(
            "ROLLBACK"
          );

          return NextResponse.json(
            {
              error:
                "Écriture financière introuvable.",
            },
            {
              status: 404,
            }
          );
        }

        if (
          entry.status === "paid"
        ) {
          await client.query(
            "ROLLBACK"
          );

          return NextResponse.json(
            {
              error:
                "Une écriture entièrement payée ne peut pas être annulée directement.",
            },
            {
              status: 400,
            }
          );
        }

        await client.query(
          `
            UPDATE member_financial_entries
            SET
              status = 'cancelled',
              cancelled_at = NOW(),
              updated_at = NOW()
            WHERE id = $1
          `,
          [entry.id]
        );

        await client.query(
          `
            INSERT INTO member_audit_logs (
              actor_type,
              actor_identifier,
              action,
              entity_type,
              entity_id,
              details
            )
            VALUES (
              'admin',
              $1,
              'financial_entry_cancelled',
              'member_financial_entry',
              $2,
              $3::jsonb
            )
          `,
          [
            administrator,
            entry.id,
            JSON.stringify({
              memberId,
            }),
          ]
        );

        await client.query("COMMIT");

        return NextResponse.json({
          success: true,
          message:
            "L’écriture financière a été annulée.",
        });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    }

    return NextResponse.json(
      {
        error: "Action inconnue.",
      },
      {
        status: 400,
      }
    );
  } catch (error) {
    console.error(
      "Erreur d’administration financière :",
      error
    );

    return NextResponse.json(
      {
        error:
          "L’opération financière a échoué.",
      },
      {
        status: 500,
      }
    );
  }
}
