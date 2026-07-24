import Link from "next/link";
import {
  redirect,
} from "next/navigation";

import {
  getDatabasePool,
} from "../../lib/database";

import {
  getCurrentMember,
} from "../../lib/member-session";

import MemberDashboardClient from
  "../../components/MemberDashboardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatMoney(
  amountCents: number
) {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency: "EUR",
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

export default async function MemberDashboardPage() {
  const member =
    await getCurrentMember();

  if (!member) {
    redirect(
      "/espace-membre/connexion"
    );
  }

  const pool =
    getDatabasePool();

  const financeResult =
    await pool.query<{
      total_due_cents: string;
      sanction_due_cents: string;
      contribution_due_cents: string;
    }>(
      `
        SELECT
          COALESCE(
            SUM(
              CASE
                WHEN status IN (
                  'pending',
                  'partially_paid',
                  'overdue',
                  'contested'
                )
                THEN amount_cents
                ELSE 0
              END
            ),
            0
          )::text AS total_due_cents,

          COALESCE(
            SUM(
              CASE
                WHEN entry_type IN (
                  'sanction',
                  'damage_reimbursement'
                )
                AND status IN (
                  'pending',
                  'partially_paid',
                  'overdue',
                  'contested'
                )
                THEN amount_cents
                ELSE 0
              END
            ),
            0
          )::text AS sanction_due_cents,

          COALESCE(
            SUM(
              CASE
                WHEN entry_type =
                  'contribution'
                AND status IN (
                  'pending',
                  'partially_paid',
                  'overdue'
                )
                THEN amount_cents
                ELSE 0
              END
            ),
            0
          )::text AS contribution_due_cents

        FROM member_financial_entries
        WHERE member_id = $1
      `,
      [member.memberId]
    );

  const finances =
    financeResult.rows[0];

  const totalDue =
    Number(
      finances?.total_due_cents || 0
    );

  const sanctionDue =
    Number(
      finances?.sanction_due_cents || 0
    );

  const contributionDue =
    Number(
      finances?.contribution_due_cents || 0
    );

  const limited =
    member.accessStatus === "limited" ||
    member.membershipStatus ===
      "limited";

  return (
    <MemberDashboardClient
      member={{
        firstName:
          member.firstName,
        memberNumber:
          member.memberNumber,
        membershipStatus:
          member.membershipStatus,
        contributionStatus:
          member.contributionStatus,
        contributionValidUntil:
          member.contributionValidUntil
            ? new Date(
                member.contributionValidUntil
              ).toISOString()
            : null,
        role:
          member.role,
        accessStatus:
          member.accessStatus,
      }}
      totalDue={totalDue}
      contributionDue={
        contributionDue
      }
      sanctionDue={sanctionDue}
      limited={limited}
    />
  );

}
