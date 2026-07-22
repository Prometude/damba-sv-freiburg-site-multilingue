import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import MembershipForm from "../../components/MembershipForm";

export const metadata: Metadata = {
  title: "Devenir membre | Damba SV Freiburg",
  description:
    "Remplissez le formulaire officiel d’inscription à Damba SV Freiburg.",
};

export default function RegistrationPage() {
  return (
    <main className="registration-page">
      <section className="registration-hero">
        <div className="registration-hero-container">
          <div className="registration-hero-content">
            <Link
              href="/"
              className="registration-back-link"
            >
              <span aria-hidden="true">←</span>
              Retour à l’accueil
            </Link>

            <span className="registration-kicker">
              Rejoignez notre communauté
            </span>

            <h1>
              Devenir membre de Damba SV Freiburg
            </h1>

            <p>
              Football, intégration et solidarité :
              rejoignez un club où chacun peut progresser,
              participer et contribuer à la vie collective.
            </p>

            <div className="registration-benefits">
              <span>✓ Activités sportives régulières</span>
              <span>✓ Intégration et solidarité</span>
              <span>✓ Communauté multiculturelle</span>
            </div>
          </div>

          <div className="registration-hero-logo">
            <Image
              src="/logo-damba.png"
              alt="Logo de Damba SV Freiburg"
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

              <h2>Remplissez le formulaire</h2>

              <p>
                Indiquez vos coordonnées et le type
                d’adhésion souhaité.
              </p>
            </div>

            <div className="registration-sidebar-card">
              <span className="registration-sidebar-number">
                02
              </span>

              <h2>Étude de la demande</h2>

              <p>
                Le comité examine les informations
                communiquées.
              </p>
            </div>

            <div className="registration-sidebar-card">
              <span className="registration-sidebar-number">
                03
              </span>

              <h2>Prise de contact</h2>

              <p>
                Un responsable vous contacte pour vous
                présenter les prochaines étapes.
              </p>
            </div>

            <div className="registration-sidebar-help">
              <h2>Besoin d’aide ?</h2>

              <p>
                Vous pouvez également utiliser la page de
                contact du club.
              </p>

              <Link href="/#contact">
                Contacter Damba
              </Link>
            </div>
          </aside>

          <div className="registration-form-card">
            <div className="registration-form-intro">
              <span className="section-kicker">
                Formulaire officiel
              </span>

              <h2>Demande d’inscription</h2>

              <p>
                Veuillez fournir des informations correctes.
                Elles seront utilisées uniquement pour
                examiner et traiter votre demande.
              </p>
            </div>

            <MembershipForm />
          </div>
        </div>
      </section>
    </main>
  );
}
