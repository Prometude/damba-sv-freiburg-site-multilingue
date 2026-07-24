"use client";

import Image from "next/image";
import Link from "next/link";
import { CircleUserRound } from "lucide-react";

import {
  useLanguage,
} from "./LanguageProvider";

import OpenMembershipButton from
  "./OpenMembershipButton";

import LanguageDropdown from
  "./LanguageDropdown";

export default function Header() {
  const { t } = useLanguage();

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link
          href="/"
          className="brand"
          aria-label="Damba SV Freiburg"
        >
          <Image
            src="/logo_damba.png"
            alt="Logo Damba SV Freiburg"
            width={66}
            height={66}
            priority
          />

          <span>
            <strong>Damba SV</strong>
            <small>Freiburg</small>
          </span>
        </Link>

        <Link
          href="/espace-membre/connexion"
          className="member-login-link member-login-mobile"
          aria-label={t("nav.memberLogin")}
          data-tooltip={t("nav.memberLogin")}
        >
          <CircleUserRound
            size={28}
            strokeWidth={2.1}
            aria-hidden="true"
          />
        </Link>

        <nav aria-label="Navigation principale">
          <Link href="/">
            {t("nav.home")}
          </Link>

          <Link href="/#club">
            {t("nav.club")}
          </Link>

          <Link href="/#activites">
            {t("nav.activities")}
          </Link>

          <Link href="/#actualites">
            {t("nav.news")}
          </Link>

          <OpenMembershipButton
            className="btn btn-small"
          >
            {t("nav.join")}
          </OpenMembershipButton>

          <Link
            href="/espace-membre/connexion"
            className="member-login-link member-login-desktop"
            aria-label={t("nav.memberLogin")}
            data-tooltip={t("nav.memberLogin")}
          >
            <CircleUserRound
              size={27}
              strokeWidth={2.1}
              aria-hidden="true"
            />
          </Link>

          <LanguageDropdown />
        </nav>
      </div>
    </header>
  );
}
