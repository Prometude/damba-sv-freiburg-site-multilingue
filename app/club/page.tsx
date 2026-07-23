import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Eye,
  GraduationCap,
  HandHeart,
  Handshake,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";

const historyItems = [
  {
    year: "2024",
    title: "Naissance du projet",
    text: "Création de Damba SV Freiburg autour d’une passion commune pour le football.",
  },
  {
    year: "2025",
    title: "Premières activités",
    text: "Organisation des entraînements, premiers matchs et premières participations aux tournois.",
  },
  {
    year: "2026",
    title: "Nouvelle vision",
    text: "Restructuration, formalisation des 4 piliers, Damba Care et projet de création officielle du Verein.",
  },
  {
    year: "2030",
    title: "Ambition",
    text: "Devenir une référence sportive, sociale et communautaire à Freiburg.",
  },
];

const missions = [
  {
    title: "Développer le football",
    icon: Trophy,
  },
  {
    title: "Renforcer la solidarité",
    icon: HeartHandshake,
  },
  {
    title: "Favoriser l’intégration",
    icon: Users,
  },
  {
    title: "Former les jeunes",
    icon: GraduationCap,
  },
  {
    title: "Accompagner les membres",
    icon: Handshake,
  },
  {
    title: "Représenter Freiburg",
    icon: Sparkles,
  },
];

const values = [
  {
    title: "Respect",
    text: "Reconnaître la dignité de chaque personne, sur le terrain comme en dehors.",
    icon: ShieldCheck,
  },
  {
    title: "Solidarité",
    text: "Être présent dans les moments heureux comme dans les épreuves.",
    icon: HandHeart,
  },
  {
    title: "Responsabilité",
    text: "Assumer ses engagements et contribuer à la réussite collective.",
    icon: Target,
  },
  {
    title: "Discipline",
    text: "Respecter les règles, les horaires et les engagements du club.",
    icon: ShieldCheck,
  },
  {
    title: "Intégration",
    text: "Favoriser l’ouverture, la diversité et le vivre-ensemble.",
    icon: Users,
  },
  {
    title: "Excellence",
    text: "Chercher à progresser continuellement sur le plan sportif et humain.",
    icon: Sparkles,
  },
];

export const metadata = {
  title: "Qui sommes-nous ? | Damba SV Freiburg",
  description:
    "Découvrez l’identité, l’histoire, la vision, les missions et les valeurs de Damba SV Freiburg.",
};

export default function ClubPage() {
  return (
    <main className="club-page">
      <section className="club-hero">
        <div className="container club-hero-inner">
          <div className="club-hero-content">
            <span className="club-kicker club-kicker-gold">
              Damba SV Freiburg
            </span>

            <h1>Qui sommes-nous&nbsp;?</h1>

            <p>
              Damba SV Freiburg est une communauté sportive, sociale et
              citoyenne qui utilise le football pour rassembler, intégrer
              et accompagner.
            </p>
          </div>

          <div className="club-hero-logo">
            <Image
              src="/damba.png"
              alt="Logo Damba SV Freiburg"
              width={130}
              height={130}
              priority
            />
          </div>
        </div>
      </section>

      <section className="club-section club-intro-section">
        <div className="container club-intro-grid">
          <div className="club-intro-copy">
            <span className="club-kicker">Notre identité</span>

            <h2>Plus qu&apos;une équipe, une famille.</h2>

            <p>
              Damba SV Freiburg est né d&apos;une conviction simple&nbsp;:
              le football a le pouvoir de rassembler les personnes
              au-delà de leurs origines, de leurs parcours et de leurs
              différences.
            </p>

            <p>
              Notre ambition n&apos;est pas seulement de gagner des matchs
              ou des tournois. Nous voulons construire une institution
              durable fondée sur le respect, la solidarité,
              l&apos;intégration et l&apos;excellence.
            </p>

            <div className="club-intro-actions">
              <Link href="/inscription" className="club-btn club-btn-gold">
                Rejoindre Damba
              </Link>

              <Link href="/#activites" className="club-btn club-btn-outline">
                Découvrir nos piliers
              </Link>
            </div>
          </div>

          <aside className="club-motto-card">
            <span>Devise officielle</span>

            <h2>Spass eu haben.</h2>

            <p>
              Parce que le plaisir de jouer, de partager et de construire
              ensemble constitue le point de départ de notre projet.
            </p>
          </aside>
        </div>
      </section>

      <section className="club-section club-history-section">
        <div className="container">
          <div className="club-section-heading">
            <span className="club-kicker">Notre histoire</span>
            <h2>Une aventure en construction</h2>
            <p>
              Damba SV Freiburg se construit progressivement, avec une
              volonté claire&nbsp;: transformer une passion sportive en
              véritable projet associatif durable.
            </p>
          </div>

          <div className="club-history-grid">
            {historyItems.map((item) => (
              <article className="club-history-card" key={item.year}>
                <div className="club-icon-square">
                  <CalendarDays size={23} strokeWidth={2.2} />
                </div>

                <strong className="club-history-year">{item.year}</strong>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="club-section club-vision-section">
        <div className="container club-vision-grid">
          <article className="club-vision-card club-vision-dark">
            <div className="club-vision-icon club-vision-icon-gold">
              <Eye size={29} />
            </div>

            <h2>Notre vision</h2>

            <p>
              Construire à Freiburg une communauté sportive reconnue pour
              son excellence, sa solidarité, son professionnalisme et sa
              capacité à favoriser l&apos;intégration des personnes
              partageant les valeurs de Damba.
            </p>
          </article>

          <article className="club-vision-card club-vision-green">
            <div className="club-vision-icon">
              <Target size={29} />
            </div>

            <h2>Notre mission</h2>

            <p>
              Utiliser le football comme levier d&apos;intégration, de
              solidarité, de développement personnel, de transmission des
              valeurs humaines et de création d&apos;opportunités pour les
              membres.
            </p>
          </article>
        </div>
      </section>

      <section className="club-section club-missions-section">
        <div className="container">
          <div className="club-section-heading club-section-heading-centered">
            <span className="club-kicker">Nos missions</span>
            <h2>Ce que nous voulons accomplir</h2>
          </div>

          <div className="club-missions-grid">
            {missions.map(({ title, icon: Icon }) => (
              <article className="club-mission-card" key={title}>
                <div className="club-icon-square">
                  <Icon size={24} strokeWidth={2.2} />
                </div>

                <h3>{title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="club-section club-values-section">
        <div className="container">
          <div className="club-section-heading">
            <span className="club-kicker">Nos valeurs</span>
            <h2>Les principes qui guident nos actions</h2>
          </div>

          <div className="club-values-grid">
            {values.map(({ title, text, icon: Icon }) => (
              <article className="club-value-card" key={title}>
                <div className="club-icon-square">
                  <Icon size={22} strokeWidth={2.2} />
                </div>

                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
