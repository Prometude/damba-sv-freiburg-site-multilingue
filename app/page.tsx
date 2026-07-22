"use client";

import { useLanguage } from "../../components/LanguageProvider";

export default function RegistrationPage() {
  const { t } = useLanguage();

  return (
    <main className="registration-page">
      <section className="section">
        <div className="container">
          <div className="registration-page-header">
            <span className="section-kicker">
              {t("smart.kicker")}
            </span>

            <h1>{t("registration.title")}</h1>

            <p>{t("registration.intro")}</p>
          </div>

          <div className="registration-page-content">
            <h2>Formulaire d’inscription</h2>

            <p>
              Le formulaire complet d’adhésion sera affiché directement dans
              cette section.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
