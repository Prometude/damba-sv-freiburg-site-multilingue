"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navigation = [
  {
    label: "Accueil",
    href: "/",
  },
  {
    label: "Le club",
    href: "/#club",
  },
  {
    label: "Nos équipes",
    href: "/#equipes",
  },
  {
    label: "Activités",
    href: "/#activites",
  },
  {
    label: "Actualités",
    href: "/#actualites",
  },
  {
    label: "Contact",
    href: "/#contact",
  },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="header-container">
        <Link
          href="/"
          className="header-logo"
          aria-label="Retour à l’accueil"
        >
          <Image
            src="/logo-damba.png"
            alt="Logo de Damba SV Freiburg"
            width={72}
            height={72}
            priority
            className="header-logo-image"
          />

          <div className="header-brand">
            <span className="header-brand-name">Damba SV Freiburg</span>
            <span className="header-brand-tagline">
              Football • Intégration • Solidarité
            </span>
          </div>
        </Link>

        <nav className="desktop-navigation" aria-label="Navigation principale">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}

          <Link href="/inscription" className="header-cta">
            Devenir membre
          </Link>
        </nav>

        <button
          type="button"
          className={`mobile-menu-button ${menuOpen ? "is-open" : ""}`}
          onClick={() => setMenuOpen((currentValue) => !currentValue)}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav
        id="mobile-navigation"
        className={`mobile-navigation ${menuOpen ? "is-open" : ""}`}
        aria-label="Navigation mobile"
      >
        <div className="mobile-navigation-content">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}

          <Link href="/inscription" className="mobile-navigation-cta">
            Devenir membre
          </Link>
        </div>
      </nav>
    </header>
  );
}
