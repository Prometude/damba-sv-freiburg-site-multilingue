"use client";
import { useEffect } from "react";
import OpenMembershipButton from "../../components/OpenMembershipButton";
import { useLanguage } from "../../components/LanguageProvider";
export default function RegistrationPage(){const{t}=useLanguage();useEffect(()=>{window.dispatchEvent(new Event("open-membership-modal"))},[]);return <section className="section"><div className="container" style={{textAlign:"center",padding:"80px 0"}}><span className="section-kicker">{t("smart.kicker")}</span><h1>{t("registration.title")}</h1><p>{t("registration.intro")}</p><OpenMembershipButton>{t("nav.join")}</OpenMembershipButton></div></section>}
