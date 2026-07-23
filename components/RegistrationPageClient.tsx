"use client";

import Image from "next/image";
import Link from "next/link";

import { useLanguage } from "./LanguageProvider";
import MembershipForm from "./MembershipForm";

export default function RegistrationPageClient() {
  const { t } = useLanguage();

  return (
    <main className="registration-page">
      <section className="registration-hero">
        <div className="registration-hero-container">
          <div className="registration-hero-content">
            <Link href="/" className="registration-back-link">
              <span aria-hidden="true">←</span>
              {t("registration.back")}
            </Link>

            <span className="registration-kicker">
              {t("registration.page.kicker")}
            </span>

            <h1>{t("registration.heading")}</h1>

            <p>{t("registration.description")}</p>

            <div className="registration-benefits">
              <span>
                ✓ {t("registration.benefit.activities")}
              </span>

              <span>
                ✓ {t("registration.benefit.integration")}
              </span>

              <span>
                ✓ {t("registration.benefit.community")}
              </span>
            </div>
          </div>

          <div className="registration-hero-logo">
            <Image
              src="/damba.png"
              alt="Logo Damba SV Freiburg"
              width={220}
              height={220}
              priority
            />
          </div>
        </div>
      </section>

      <section className="registration-main-section">
        <div className="registration-main-container">
          <aside className="registration-sidebar">
            <div className="registration-sidebar-card">
              <span className="registration-sidebar-number">
                01
              </span>

              <h2>{t("registration.step1.title")}</h2>

              <p>{t("registration.step1.text")}</p>
            </div>

            <div className="registration-sidebar-card">
              <span className="registration-sidebar-number">
                02
              </span>

              <h2>{t("registration.step2.title")}</h2>

              <p>{t("registration.step2.text")}</p>
            </div>

            <div className="registration-sidebar-card">
              <span className="registration-sidebar-number">
                03
              </span>

              <h2>{t("registration.step3.title")}</h2>

              <p>{t("registration.step3.text")}</p>
            </div>

            <div className="registration-sidebar-help">
              <h2>{t("registration.help.title")}</h2>

              <p>{t("registration.help.text")}</p>

              
            </div>
          </aside>

          <div className="registration-form-card">
            <div className="registration-form-intro">
              <span className="section-kicker">
                {t("registration.form.kicker")}
              </span>

              <h2>{t("registration.form.title")}</h2>

              <p>{t("registration.form.intro")}</p>
            </div>

            <MembershipForm />
          </div>
        </div>
      </section>
    </main>
  );
}
