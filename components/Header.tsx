"use client";
import Image from "next/image";
import Link from "next/link";
import { Language, useLanguage } from "./LanguageProvider";
import OpenMembershipButton from "./OpenMembershipButton";
import LanguageDropdown from "./LanguageDropdown";
export default function Header(){const{language,setLanguage,t}=useLanguage();return <header className="site-header"><div className="container nav-wrap"><Link href="/" className="brand"><Image src="/logo_damba.png" alt="Logo Damba SV Freiburg" width={66} height={66} priority/><span><strong>Damba SV</strong><small>Freiburg</small></span></Link><nav aria-label="Navigation"><Link href="/">{t("nav.home")}</Link><Link href="/#club">{t("nav.club")}</Link><Link href="/#activites">{t("nav.activities")}</Link><Link href="/#actualites">{t("nav.news")}</Link><OpenMembershipButton className="btn btn-small">{t("nav.join")}</OpenMembershipButton><LanguageDropdown /></nav></div></header>}
