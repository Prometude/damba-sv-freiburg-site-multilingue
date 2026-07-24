"use client";

import Link from "next/link";

import {
  useLanguage,
} from "./LanguageProvider";

import {
  getMemberLocale,
  getMemberText,
  getMemberValueLabel,
} from "../lib/member-i18n";

type MemberData = {
  firstName: string;
  memberNumber: string | null;
  membershipStatus: string;
  contributionStatus: string;
  contributionValidUntil: string | null;
  role: string;
  accessStatus: string;
};

type Props = {
  member: MemberData;
  totalDue: number;
  contributionDue: number;
  sanctionDue: number;
  limited: boolean;
};

export default function MemberDashboardClient({
  member,
  totalDue,
  contributionDue,
  sanctionDue,
  limited,
}: Props) {
  const { language } =
    useLanguage();

  const locale =
    getMemberLocale(language);

  const text = (
    key: Parameters<
      typeof getMemberText
    >[1]
  ) => getMemberText(language, key);

  function formatMoney(
    amountCents: number
  ) {
    return new Intl.NumberFormat(
      locale,
      {
        style: "currency",
        currency: "EUR",
      }
    ).format(amountCents / 100);
  }

  function formatDate(
    value: string | null
  ) {
    if (!value) {
      return text(
        "common.notDefined"
      );
    }

    return new Intl.DateTimeFormat(
      locale,
      {
        dateStyle: "long",
        timeZone:
          "Europe/Berlin",
      }
    ).format(new Date(value));
  }

  return (
    <main className="member-dashboard">
      <header className="member-dashboard-header">
        <div>
          <span>
            {text(
              "dashboard.memberArea"
            )}
          </span>

          <h1>
            {text(
              "dashboard.welcome"
            )}
            , {member.firstName}
          </h1>

          <p>
            {text(
              "dashboard.memberNumber"
            )}
            :{" "}
            <strong>
              {member.memberNumber ||
                text(
                  "common.notAssigned"
                )}
            </strong>
          </p>
        </div>

        <form
          method="post"
          action="/api/member/logout"
        >
          <button type="submit">
            {text(
              "dashboard.logout"
            )}
          </button>
        </form>
      </header>

      {limited && (
        <div className="member-dashboard-warning">
          {text(
            "dashboard.limitedWarning"
          )}
        </div>
      )}

      <section className="member-dashboard-status">
        <article>
          <span>
            {text(
              "dashboard.membership"
            )}
          </span>

          <strong>
            {getMemberValueLabel(
              "membershipStatus",
              member.membershipStatus,
              language
            )}
          </strong>
        </article>

        <article>
          <span>
            {text(
              "dashboard.contribution"
            )}
          </span>

          <strong>
            {getMemberValueLabel(
              "contributionStatus",
              member.contributionStatus,
              language
            )}
          </strong>
        </article>

        <article>
          <span>
            {text(
              "dashboard.validUntil"
            )}
          </span>

          <strong>
            {formatDate(
              member.contributionValidUntil
            )}
          </strong>
        </article>

        <article>
          <span>
            {text(
              "dashboard.role"
            )}
          </span>

          <strong>
            {getMemberValueLabel(
              "role",
              member.role,
              language
            )}
          </strong>
        </article>
      </section>

      <section className="member-dashboard-section">
        <div className="member-dashboard-title">
          <div>
            <span>
              {text(
                "dashboard.personalSituation"
              )}
            </span>

            <h2>
              {text(
                "dashboard.financialSummary"
              )}
            </h2>
          </div>

          <Link href="/espace-membre/finances">
            {text(
              "dashboard.viewDetails"
            )}
          </Link>
        </div>

        <div className="member-finance-summary">
          <article>
            <span>
              {text(
                "dashboard.totalDue"
              )}
            </span>

            <strong>
              {formatMoney(totalDue)}
            </strong>
          </article>

          <article>
            <span>
              {text(
                "dashboard.contributionsDue"
              )}
            </span>

            <strong>
              {formatMoney(
                contributionDue
              )}
            </strong>
          </article>

          <article>
            <span>
              {text(
                "dashboard.sanctionsDamage"
              )}
            </span>

            <strong>
              {formatMoney(
                sanctionDue
              )}
            </strong>
          </article>
        </div>
      </section>

      <section className="member-dashboard-links">
        <Link href="/espace-membre/profil">
          <strong>
            {text(
              "dashboard.profile"
            )}
          </strong>

          <span>
            {text(
              "dashboard.profileText"
            )}
          </span>
        </Link>

        <Link href="/espace-membre/finances">
          <strong>
            {text(
              "dashboard.finances"
            )}
          </strong>

          <span>
            {text(
              "dashboard.financesText"
            )}
          </span>
        </Link>

        {!limited && (
          <>
            <Link href="/espace-membre/entrainements">
              <strong>
                {text(
                  "dashboard.training"
                )}
              </strong>

              <span>
                {text(
                  "dashboard.trainingText"
                )}
              </span>
            </Link>

            <Link href="/espace-membre/documents">
              <strong>
                {text(
                  "dashboard.documents"
                )}
              </strong>

              <span>
                {text(
                  "dashboard.documentsText"
                )}
              </span>
            </Link>

            <Link href="/espace-membre/actualites">
              <strong>
                {text(
                  "dashboard.news"
                )}
              </strong>

              <span>
                {text(
                  "dashboard.newsText"
                )}
              </span>
            </Link>

            <Link href="/espace-membre/damba-care">
              <strong>
                {text(
                  "dashboard.care"
                )}
              </strong>

              <span>
                {text(
                  "dashboard.careText"
                )}
              </span>
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
