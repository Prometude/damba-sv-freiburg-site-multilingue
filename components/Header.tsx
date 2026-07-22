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

  /*
   * Ferme le menu mobile lorsqu’on change de page.
   */
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  /*
   * Empêche la page de défiler lorsque le menu mobile est ouvert.
   */
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

  function closeMobileMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Logo et nom du club */}
        <Link
          href="/"
          className="header-logo"
          aria-label="Retour à l’accueil"
          onClick={closeMobileMenu}
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
            <span className="header-brand-name">
              Damba SV Freiburg
            </span>

            <span className="header-brand-tagline">
              Football • Intégration • Solidarité
            </span>
          </div>
        </Link>

        {/* Navigation sur ordinateur */}
        <nav
          className="desktop-navigation"
          aria-label="Navigation principale"
        >
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}

          {/* Lien vers la page dédiée d’inscription */}
          <Link href="/inscription" className="header-cta">
            Devenir membre
          </Link>
        </nav>

        {/* Bouton du menu mobile */}
        <button
          type="button"
          className={`mobile-menu-button ${
            menuOpen ? "is-open" : ""
          }`}
          onClick={() =>
            setMenuOpen((currentValue) => !currentValue)
          }
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={
            menuOpen ? "Fermer le menu" : "Ouvrir le menu"
          }
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Navigation sur téléphone */}
      <nav
        id="mobile-navigation"
        className={`mobile-navigation ${
          menuOpen ? "is-open" : ""
        }`}
        aria-label="Navigation mobile"
      >
        <div className="mobile-navigation-content">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileMenu}
            >
              {item.label}
            </Link>
          ))}

          {/* Lien mobile vers la page dédiée d’inscription */}
          <Link
            href="/inscription"
            className="mobile-navigation-cta"
            onClick={closeMobileMenu}
          >
            Devenir membre
          </Link>
        </div>
      </nav>
    </header>
  );
}
