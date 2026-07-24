"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, HeartHandshake, MapPin, ShieldCheck, Trophy, Users } from "lucide-react";
import { useLanguage } from "../components/LanguageProvider";
import OpenMembershipButton from "../components/OpenMembershipButton";
import TrainingAttendance from "../components/TrainingAttendance";

import ScrollToTop from "../components/ScrollToTop";

export default function HomePage() {
  const { t } = useLanguage();
  const [heroSlide,setHeroSlide]=useState(0); const [newsSlide,setNewsSlide]=useState(0);
  const images=["/Rasen.png","/kunstrasen.png"];
  useEffect(()=>{const id=setInterval(()=>setHeroSlide(s=>(s+1)%2),5000);return()=>clearInterval(id)},[]);
  useEffect(()=>{const id=setInterval(()=>setNewsSlide(s=>(s+1)%2),6500);return()=>clearInterval(id)},[]);
  const activities = [
    { icon: Trophy, title: t("activity.competitive.title"), text: t("activity.competitive.text") },
    { icon: Users, title: t("activity.leisure.title"), text: t("activity.leisure.text") },
    { icon: HeartHandshake, title: t("activity.care.title"), text: t("activity.care.text") },
    { icon: ShieldCheck, title: t("activity.values.title"), text: t("activity.values.text") }
  ];
  const news=[
    {image:"/Rasen.png",title:t("news.one.title"),text:t("news.one.text")},
    {image:"/kunstrasen.png",title:t("news.two.title"),text:t("news.two.text")}
  ];
  return <>
      <ScrollToTop />
    <section className="hero"><div className="container hero-grid">
      <div className="hero-copy"><span className="eyebrow">{t("hero.eyebrow")}</span><h1>{t("hero.title")}</h1><p>{t("hero.text")}</p>
        <div className="hero-actions">
  <OpenMembershipButton>
    {t("hero.join")} <ArrowRight size={18} />
  </OpenMembershipButton>

  <Link href="#club" className="btn btn-ghost">
    {t("hero.discover")}
  </Link>

  <Link
    href="#entrainement"
    className="btn btn-training"
  >
    {t("hero.training")}
  </Link>
</div>
        <div className="stats"><div><strong>2</strong><span>{t("stats.teams")}</span></div><div><strong>4</strong><span>{t("stats.pillars")}</span></div><div><strong>1</strong><span>{t("stats.community")}</span></div></div>
      </div>
      <div className="hero-slider" aria-label="Damba SV Freiburg terrains">
        {images.map((src,i)=><div key={src} className={`hero-slide ${heroSlide===i?"active":""}`}><Image src={src} alt={i===0?"Terrain en gazon naturel":"Terrain en gazon synthétique"} fill priority={i===0} sizes="(max-width: 900px) 100vw, 45vw"/></div>)}
        <div className="hero-slider-overlay"><Image src="/logo_damba.png" alt="Logo Damba SV Freiburg" width={72} height={72}/><div><strong>Damba SV Freiburg</strong><span>« Spass eu haben »</span></div></div>
        <div className="slider-dots">{images.map((_,i)=><button key={i} aria-label={`Slide ${i+1}`} className={heroSlide===i?"active":""} onClick={()=>setHeroSlide(i)}/>)}</div>
      </div>
    </div>
</section>

    <section className="training-strip"><div className="container training-inner"><span className="training-icon"><CalendarDays/></span><div><span className="section-kicker light">{t("training.kicker")}</span><h2>{t("training.title")}</h2><p>{t("training.text")}</p></div><div className="training-place"><MapPin/><strong>{t("training.address")}</strong></div></div></section>

    <TrainingAttendance />

    <section id="club" className="section"><div className="container split"><div><span className="section-kicker">{t("identity.kicker")}</span><h2>{t("identity.title")}</h2></div><div className="lead-block">
  <p>{t("identity.p1")}</p>
  <p>{t("identity.p2")}</p>

  <div className="identity-discover-wrap">
    <a href="/club" className="identity-discover-link">
      Découvrir
      <span aria-hidden="true">→</span>
    </a>
  </div>
</div></div></section>

    <section id="activites" className="section section-soft"><div className="container"><div className="section-head"><span className="section-kicker">{t("activities.kicker")}</span><h2>{t("activities.title")}</h2></div><div className="cards-grid">{activities.map(({icon:Icon,title,text})=><article className="feature-card" key={title}><span className="icon-box"><Icon size={26}/></span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

    <section id="actualites" className="section news-section"><div className="container"><div className="section-head"><span className="section-kicker">{t("news.kicker")}</span><h2>{t("news.title")}</h2></div><div className="news-slider">
      {news.map((item,i)=><article key={item.image} className={`news-slide ${newsSlide===i?"active":""}`}><div className="news-image"><Image src={item.image} alt={item.title} fill sizes="(max-width: 900px) 100vw, 55vw"/></div><div className="news-copy"><span>0{i+1}</span><h3>{item.title}</h3><p>{item.text}</p><div className="news-location"><MapPin size={19}/>{t("training.address")}</div></div></article>)}
      <button className="news-arrow prev" onClick={()=>setNewsSlide(s=>(s+1)%2)} aria-label="Previous"><ChevronLeft/></button><button className="news-arrow next" onClick={()=>setNewsSlide(s=>(s+1)%2)} aria-label="Next"><ChevronRight/></button>
    </div></div></section>

    <section className="section"><div className="container values"><div><span className="section-kicker">{t("values.kicker")}</span><h2>{t("values.title")}</h2></div><div className="values-list"><p>{t("values.respect")}</p><p>{t("values.discipline")}</p><p>{t("values.solidarity")}</p></div></div></section>
    <section className="cta-section"><div className="container cta-box"><div><span className="section-kicker light">{t("cta.kicker")}</span><h2>{t("cta.title")}</h2><p>{t("cta.text")}</p></div><OpenMembershipButton className="btn btn-light">{t("cta.button")} <ArrowRight size={18}/></OpenMembershipButton></div></section>

    <section className="assistant-help-section">
      <div className="container assistant-help-box">
        <div className="assistant-help-content">
          <span className="section-kicker">
            Besoin d’aide ?
          </span>

          <h2>
            Discutez avec l’assistant Damba
          </h2>

          <p>
            L’assistant Damba est disponible au bas de la page,
            dans l’angle droit. Il peut répondre aux questions
            fréquentes ou vous permettre de laisser un message
            à l’administration du club.
          </p>
        </div>

        <div className="assistant-help-indicator">
          <span aria-hidden="true">💬</span>
          <strong>Assistant Damba</strong>
          <small>Disponible en bas à droite</small>
        </div>
      </div>
    </section>
  </>;
}
