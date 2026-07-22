import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" id="contact">
      <div className="footer-container">
        <div className="footer-column footer-about">
          <div className="footer-logo-area">
            <Image
              src="/logo-damba.png"
              alt="Logo de Damba SV Freiburg"
              width={72}
              height={72}
              className="footer-logo"
            />

            <div>
              <strong>Damba SV Freiburg</strong>
              <p>Football, intégration et solidarité.</p>
            </div>
          </div>

          <p className="footer-description">
            Une communauté sportive ouverte, engagée et solidaire à Freiburg im
            Breisgau.
          </p>
        </div>

        <div className="footer-column">
          <h2>Navigation</h2>

          <Link href="/">Accueil</Link>
          <Link href="/#club">Le club</Link>
          <Link href="/#equipes">Nos équipes</Link>
          <Link href="/#actualites">Actualités</Link>
          <Link href="/inscription">Adhésion</Link>
        </div>

        <div className="footer-column">
          <h2>Entraînement</h2>

          <p>Samedi, 17h00–19h00</p>
          <p>Schönbergstadion</p>
          <p>Wiesentalstraße 2</p>
          <p>79115 Freiburg im Breisgau</p>
        </div>

        <div className="footer-column">
          <h2>Contact</h2>

          <a href="mailto:contact@dambasv-freiburg.de">
            contact@dambasv-freiburg.de
          </a>

          <Link href="/impressum">Impressum</Link>
          <Link href="/datenschutz">Datenschutz</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {currentYear} Damba SV Freiburg. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
