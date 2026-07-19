"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "fr" | "en" | "de";

type Dictionary = Record<string, string>;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const dictionaries: Record<Language, Dictionary> = {
  fr: {
    "nav.home": "Accueil",
    "nav.club": "Le club",
    "nav.activities": "Activités",
    "nav.news": "Actualités",
    "nav.join": "Devenir membre",

    "hero.eyebrow": "Damba SV Freiburg • Depuis 2024",
    "hero.title": "Plus qu’un club de football.",
    "hero.text":
      "Damba SV Freiburg rassemble des passionnés autour du sport, de l’intégration, de la discipline et de la solidarité.",
    "hero.join": "Devenir membre",
    "hero.discover": "Découvrir le club",

    "stats.teams": "équipes",
    "stats.pillars": "piliers",
    "stats.community": "communauté",

    "identity.kicker": "Notre identité",
    "identity.title": "Un club qui unit sport et communauté",
    "identity.p1":
      "Damba SV Freiburg est un projet sportif et social basé à Freiburg im Breisgau. Notre objectif est de permettre à chacun de pratiquer le football dans un cadre organisé, respectueux et fraternel.",
    "identity.p2":
      "Le club favorise l’intégration, la responsabilisation, l’engagement collectif et l’entraide entre ses membres.",

    "activities.kicker": "Nos activités",
    "activities.title": "Une place pour chaque passionné",
    "activity.competitive.title": "Football compétitif",
    "activity.competitive.text":
      "Une équipe ambitieuse, disciplinée et orientée vers la performance.",
    "activity.leisure.title": "Football loisirs",
    "activity.leisure.text":
      "Des séances conviviales accessibles aux membres de tous niveaux.",
    "activity.care.title": "Damba Care",
    "activity.care.text":
      "Un esprit de solidarité pour accompagner les membres dans les moments importants.",
    "activity.values.title": "Intégration & valeurs",
    "activity.values.text":
      "Respect, responsabilité, fair-play et intégration par le sport.",

    "values.kicker": "Nos valeurs",
    "values.title": "Respect. Discipline. Solidarité.",
    "values.respect":
      "Respect : chacun agit avec dignité envers les joueurs, les dirigeants, les arbitres et les installations.",
    "values.discipline":
      "Discipline : la ponctualité, la fiabilité et le respect des règles protègent le collectif.",
    "values.solidarity":
      "Solidarité : le club crée des liens durables au-delà du terrain.",

    "training.kicker": "Entraînements",
    "training.title": "Rendez-vous chaque samedi",
    "training.text":
      "Tous les samedis de 17h00 à 19h00 au Schönbergstadion.",
    "training.address":
      "Schönbergstadion, Wiesentalstraße 2, 79115 Freiburg im Breisgau",

    "news.kicker": "Actualités",
    "news.title": "La vie du club en images",
    "news.one.title": "Football sur gazon naturel",
    "news.one.text":
      "Des séances sportives, conviviales et structurées pour progresser ensemble.",
    "news.two.title": "Entraînement sur terrain synthétique",
    "news.two.text":
      "Un cadre moderne pour pratiquer toute l’année, dans le respect et la bonne humeur.",

    "cta.kicker": "Rejoignez-nous",
    "cta.title": "Prêt à faire partie de l’aventure ?",
    "cta.text":
      "Remplissez le formulaire d’adhésion. Notre équipe vous contactera.",
    "cta.button": "S’inscrire maintenant",

    "footer.tagline": "Sport, intégration, solidarité.",
    "footer.location": "Freiburg im Breisgau, Allemagne",
    "footer.membership": "Adhésion",
    "footer.training": "Entraînement : chaque samedi, 17h00–19h00",
    "footer.follow": "Suivez-nous sur Facebook",
    "footer.contact": "Contact",

    "registration.kicker": "Adhésion",
    "registration.title": "Devenez membre de Damba SV Freiburg",
    "registration.intro":
      "Complétez ce formulaire avec des informations exactes. Nous vous contacterons pour finaliser votre inscription.",

    "step.form.title": "Formulaire",
    "step.form.text": "Envoyez vos informations.",
    "step.contact.title": "Prise de contact",
    "step.contact.text": "Un responsable vous répond.",
    "step.validation.title": "Validation",
    "step.validation.text": "Votre adhésion est confirmée.",

    "success.title": "Demande envoyée",
    "success.text":
      "Merci pour votre intérêt. Un responsable de Damba SV Freiburg vous contactera prochainement.",
    "success.new": "Nouvelle inscription",

    "form.title": "Informations du membre",
    "form.required":
      "Les champs marqués d’un astérisque sont obligatoires.",
    "form.firstName": "Prénom",
    "form.lastName": "Nom",
    "form.birthDate": "Date de naissance",
    "form.email": "E-mail",
    "form.phone": "Téléphone",
    "form.membershipType": "Type d’adhésion",
    "form.leisure": "Équipe loisirs",
    "form.competitive": "Équipe compétitive",
    "form.supporter": "Membre soutien",
    "form.address": "Adresse",
    "form.postalCode": "Code postal",
    "form.city": "Ville",
    "form.experience": "Expérience footballistique",
    "form.emergency": "Contact d’urgence",
    "form.fullName": "Nom complet",
    "form.additional": "Message complémentaire",
    "form.consent":
      "J’accepte que mes données soient utilisées pour traiter ma demande d’adhésion.",
    "form.sending": "Envoi en cours…",
    "form.submit": "Envoyer ma demande",
    "form.error": "Une erreur est survenue.",

    "smart.kicker": "Formulaire intelligent",
    "smart.title": "Demande d’adhésion",
    "smart.intro":
      "Le formulaire s’adapte automatiquement au type de membre choisi.",
    "smart.step": "Étape",
    "smart.step.1": "Type",
    "smart.step.2": "Identité",
    "smart.step.3": "Profil",
    "smart.step.4": "Disponibilité",
    "smart.step.5": "Validation",
    "smart.choose": "Choisissez votre type d’adhésion",
    "smart.identity": "Informations personnelles",
    "smart.structure": "Informations sur la structure",
    "smart.close": "Fermer",
    "smart.back": "Retour",
    "smart.next": "Continuer",

    "smart.type.sportif": "Membre sportif",
    "smart.type.actif": "Membre actif",
    "smart.type.sympathisant": "Membre sympathisant",
    "smart.type.benevole": "Bénévole",
    "smart.type.partenaire": "Partenaire / Sponsor",

    "smart.desc.sportif": "Équipe compétitive ou loisirs.",
    "smart.desc.actif": "Participer activement à la vie du club.",
    "smart.desc.sympathisant": "Soutenir Damba ponctuellement.",
    "smart.desc.benevole": "Aider aux événements et projets.",
    "smart.desc.partenaire": "Soutenir le club comme structure.",

    "smart.gender": "Genre",
    "smart.man": "Homme",
    "smart.woman": "Femme",
    "smart.other": "Autre",
    "smart.nationality": "Nationalité",
    "smart.profession": "Profession",
    "smart.organisation": "Nom de l’entreprise / structure",
    "smart.sector": "Secteur d’activité",
    "smart.website": "Site web",

    "smart.profile.sportif": "Profil sportif",
    "smart.profile.actif": "Engagement associatif",
    "smart.profile.sympathisant": "Type de soutien",
    "smart.profile.benevole": "Domaines d’aide",
    "smart.profile.partenaire": "Projet de partenariat",

    "smart.team": "Équipe souhaitée",
    "smart.position": "Poste préféré",
    "smart.level": "Niveau actuel",
    "smart.formerClub": "Ancien club",
    "smart.involvement": "Comment souhaitez-vous vous engager ?",
    "smart.skills": "Compétences ou domaines d’aide",
    "smart.partnership": "Décrivez le partenariat souhaité",
    "smart.availability": "Disponibilité et contact",
    "smart.availabilityPrompt":
      "Indiquez vos disponibilités habituelles",
    "smart.validation": "Vérification et validation",

    "smart.healthInsurance":
      "Disposez-vous d’une assurance maladie valide en Allemagne ?",
    "smart.healthInsuranceHelp":
      "Cette information est demandée uniquement pour la pratique sportive.",
    "smart.healthInsuranceYes": "Oui",
    "smart.healthInsuranceNo": "Non",
    "smart.healthInsurancePending": "En cours de clarification",
  },

  en: {
    "nav.home": "Home",
    "nav.club": "The club",
    "nav.activities": "Activities",
    "nav.news": "News",
    "nav.join": "Become a member",

    "hero.eyebrow": "Damba SV Freiburg • Since 2024",
    "hero.title": "More than a football club.",
    "hero.text":
      "Damba SV Freiburg brings enthusiasts together around sport, integration, discipline and solidarity.",
    "hero.join": "Become a member",
    "hero.discover": "Discover the club",

    "stats.teams": "teams",
    "stats.pillars": "pillars",
    "stats.community": "community",

    "identity.kicker": "Our identity",
    "identity.title": "A club that unites sport and community",
    "identity.p1":
      "Damba SV Freiburg is a sports and social project based in Freiburg im Breisgau. Our aim is to enable everyone to play football in an organised, respectful and friendly environment.",
    "identity.p2":
      "The club promotes integration, responsibility, collective commitment and mutual support among its members.",

    "activities.kicker": "Our activities",
    "activities.title": "A place for every enthusiast",
    "activity.competitive.title": "Competitive football",
    "activity.competitive.text":
      "An ambitious, disciplined team focused on performance.",
    "activity.leisure.title": "Recreational football",
    "activity.leisure.text":
      "Friendly sessions open to members of all levels.",
    "activity.care.title": "Damba Care",
    "activity.care.text":
      "A spirit of solidarity that supports members during important moments.",
    "activity.values.title": "Integration & values",
    "activity.values.text":
      "Respect, responsibility, fair play and integration through sport.",

    "values.kicker": "Our values",
    "values.title": "Respect. Discipline. Solidarity.",
    "values.respect":
      "Respect: everyone acts with dignity towards players, officials, referees and facilities.",
    "values.discipline":
      "Discipline: punctuality, reliability and respect for the rules protect the group.",
    "values.solidarity":
      "Solidarity: the club builds lasting bonds beyond the pitch.",

    "training.kicker": "Training",
    "training.title": "Meet us every Saturday",
    "training.text":
      "Every Saturday from 5:00 pm to 7:00 pm at Schönbergstadion.",
    "training.address":
      "Schönbergstadion, Wiesentalstraße 2, 79115 Freiburg im Breisgau",

    "news.kicker": "News",
    "news.title": "Club life in pictures",
    "news.one.title": "Football on natural grass",
    "news.one.text":
      "Structured and friendly sessions to improve together.",
    "news.two.title": "Training on artificial turf",
    "news.two.text":
      "A modern setting for year-round football in a respectful atmosphere.",

    "cta.kicker": "Join us",
    "cta.title": "Ready to be part of the adventure?",
    "cta.text":
      "Complete the membership form. Our team will contact you.",
    "cta.button": "Register now",

    "footer.tagline": "Sport, integration, solidarity.",
    "footer.location": "Freiburg im Breisgau, Germany",
    "footer.membership": "Membership",
    "footer.training": "Training: every Saturday, 5:00–7:00 pm",
    "footer.follow": "Follow us on Facebook",
    "footer.contact": "Contact",

    "registration.kicker": "Membership",
    "registration.title": "Become a member of Damba SV Freiburg",
    "registration.intro":
      "Complete this form with accurate information. We will contact you to finalise your registration.",

    "step.form.title": "Form",
    "step.form.text": "Send your information.",
    "step.contact.title": "Contact",
    "step.contact.text": "A representative will reply.",
    "step.validation.title": "Confirmation",
    "step.validation.text": "Your membership is confirmed.",

    "success.title": "Request sent",
    "success.text":
      "Thank you for your interest. A Damba SV Freiburg representative will contact you shortly.",
    "success.new": "New registration",

    "form.title": "Member information",
    "form.required": "Fields marked with an asterisk are required.",
    "form.firstName": "First name",
    "form.lastName": "Last name",
    "form.birthDate": "Date of birth",
    "form.email": "Email",
    "form.phone": "Phone",
    "form.membershipType": "Membership type",
    "form.leisure": "Recreational team",
    "form.competitive": "Competitive team",
    "form.supporter": "Supporting member",
    "form.address": "Address",
    "form.postalCode": "Postal code",
    "form.city": "City",
    "form.experience": "Football experience",
    "form.emergency": "Emergency contact",
    "form.fullName": "Full name",
    "form.additional": "Additional message",
    "form.consent":
      "I agree that my data may be used to process my membership request.",
    "form.sending": "Sending…",
    "form.submit": "Send my request",
    "form.error": "An error occurred.",

    "smart.kicker": "Smart form",
    "smart.title": "Membership application",
    "smart.intro":
      "The form adapts automatically to the selected member type.",
    "smart.step": "Step",
    "smart.step.1": "Type",
    "smart.step.2": "Identity",
    "smart.step.3": "Profile",
    "smart.step.4": "Availability",
    "smart.step.5": "Validation",
    "smart.choose": "Choose your membership type",
    "smart.identity": "Personal information",
    "smart.structure": "Organisation information",
    "smart.close": "Close",
    "smart.back": "Back",
    "smart.next": "Continue",

    "smart.type.sportif": "Sports member",
    "smart.type.actif": "Active member",
    "smart.type.sympathisant": "Supporting member",
    "smart.type.benevole": "Volunteer",
    "smart.type.partenaire": "Partner / Sponsor",

    "smart.desc.sportif": "Competitive or recreational team.",
    "smart.desc.actif": "Take an active role in club life.",
    "smart.desc.sympathisant": "Support Damba occasionally.",
    "smart.desc.benevole": "Help with events and projects.",
    "smart.desc.partenaire": "Support the club as an organisation.",

    "smart.gender": "Gender",
    "smart.man": "Male",
    "smart.woman": "Female",
    "smart.other": "Other",
    "smart.nationality": "Nationality",
    "smart.profession": "Profession",
    "smart.organisation": "Company / organisation name",
    "smart.sector": "Business sector",
    "smart.website": "Website",

    "smart.profile.sportif": "Sports profile",
    "smart.profile.actif": "Club involvement",
    "smart.profile.sympathisant": "Type of support",
    "smart.profile.benevole": "Areas of help",
    "smart.profile.partenaire": "Partnership project",

    "smart.team": "Preferred team",
    "smart.position": "Preferred position",
    "smart.level": "Current level",
    "smart.formerClub": "Former club",
    "smart.involvement": "How would you like to contribute?",
    "smart.skills": "Skills or areas of help",
    "smart.partnership": "Describe the desired partnership",
    "smart.availability": "Availability and contact",
    "smart.availabilityPrompt": "State your usual availability",
    "smart.validation": "Review and validation",

    "smart.healthInsurance":
      "Do you have valid health insurance in Germany?",
    "smart.healthInsuranceHelp":
      "This information is requested only for participation in sports activities.",
    "smart.healthInsuranceYes": "Yes",
    "smart.healthInsuranceNo": "No",
    "smart.healthInsurancePending": "Currently being clarified",
  },

  de: {
    "nav.home": "Startseite",
    "nav.club": "Der Verein",
    "nav.activities": "Aktivitäten",
    "nav.news": "Aktuelles",
    "nav.join": "Mitglied werden",

    "hero.eyebrow": "Damba SV Freiburg • Seit 2024",
    "hero.title": "Mehr als ein Fußballverein.",
    "hero.text":
      "Damba SV Freiburg bringt Menschen durch Sport, Integration, Disziplin und Solidarität zusammen.",
    "hero.join": "Mitglied werden",
    "hero.discover": "Verein entdecken",

    "stats.teams": "Mannschaften",
    "stats.pillars": "Säulen",
    "stats.community": "Gemeinschaft",

    "identity.kicker": "Unsere Identität",
    "identity.title": "Ein Verein, der Sport und Gemeinschaft verbindet",
    "identity.p1":
      "Damba SV Freiburg ist ein Sport- und Sozialprojekt mit Sitz in Freiburg im Breisgau. Unser Ziel ist es, allen Menschen Fußball in einem organisierten, respektvollen und freundschaftlichen Rahmen zu ermöglichen.",
    "identity.p2":
      "Der Verein fördert Integration, Verantwortung, gemeinschaftliches Engagement und gegenseitige Unterstützung.",

    "activities.kicker": "Unsere Aktivitäten",
    "activities.title": "Ein Platz für alle Fußballbegeisterten",
    "activity.competitive.title": "Leistungsfußball",
    "activity.competitive.text":
      "Eine ambitionierte, disziplinierte und leistungsorientierte Mannschaft.",
    "activity.leisure.title": "Freizeitfußball",
    "activity.leisure.text":
      "Gesellige Trainingseinheiten für Mitglieder aller Spielstärken.",
    "activity.care.title": "Damba Care",
    "activity.care.text":
      "Solidarität und Unterstützung für Mitglieder in wichtigen Lebensmomenten.",
    "activity.values.title": "Integration & Werte",
    "activity.values.text":
      "Respekt, Verantwortung, Fairplay und Integration durch Sport.",

    "values.kicker": "Unsere Werte",
    "values.title": "Respekt. Disziplin. Solidarität.",
    "values.respect":
      "Respekt: Alle begegnen Spielern, Verantwortlichen, Schiedsrichtern und Anlagen mit Würde.",
    "values.discipline":
      "Disziplin: Pünktlichkeit, Zuverlässigkeit und Regelbewusstsein schützen die Gemeinschaft.",
    "values.solidarity":
      "Solidarität: Der Verein schafft dauerhafte Verbindungen über den Fußballplatz hinaus.",

    "training.kicker": "Training",
    "training.title": "Jeden Samstag gemeinsam trainieren",
    "training.text":
      "Jeden Samstag von 17:00 bis 19:00 Uhr im Schönbergstadion.",
    "training.address":
      "Schönbergstadion, Wiesentalstraße 2, 79115 Freiburg im Breisgau",

    "news.kicker": "Aktuelles",
    "news.title": "Das Vereinsleben in Bildern",
    "news.one.title": "Fußball auf Naturrasen",
    "news.one.text":
      "Strukturierte und freundschaftliche Einheiten, um gemeinsam besser zu werden.",
    "news.two.title": "Training auf Kunstrasen",
    "news.two.text":
      "Moderne Bedingungen für ganzjährigen Fußball in respektvoller Atmosphäre.",

    "cta.kicker": "Mach mit",
    "cta.title": "Bereit, Teil unseres Weges zu werden?",
    "cta.text":
      "Fülle das Mitgliedsformular aus. Unser Team meldet sich bei dir.",
    "cta.button": "Jetzt anmelden",

    "footer.tagline": "Sport, Integration, Solidarität.",
    "footer.location": "Freiburg im Breisgau, Deutschland",
    "footer.membership": "Mitgliedschaft",
    "footer.training": "Training: jeden Samstag, 17:00–19:00 Uhr",
    "footer.follow": "Folgen Sie uns auf Facebook",
    "footer.contact": "Kontakt",

    "registration.kicker": "Mitgliedschaft",
    "registration.title": "Mitglied bei Damba SV Freiburg werden",
    "registration.intro":
      "Fülle dieses Formular mit korrekten Angaben aus. Wir kontaktieren dich, um die Anmeldung abzuschließen.",

    "step.form.title": "Formular",
    "step.form.text": "Sende deine Angaben.",
    "step.contact.title": "Kontaktaufnahme",
    "step.contact.text": "Eine verantwortliche Person antwortet dir.",
    "step.validation.title": "Bestätigung",
    "step.validation.text": "Deine Mitgliedschaft wird bestätigt.",

    "success.title": "Anfrage gesendet",
    "success.text":
      "Vielen Dank für dein Interesse. Eine verantwortliche Person von Damba SV Freiburg meldet sich bald bei dir.",
    "success.new": "Neue Anmeldung",

    "form.title": "Mitgliedsdaten",
    "form.required":
      "Mit einem Sternchen markierte Felder sind Pflichtfelder.",
    "form.firstName": "Vorname",
    "form.lastName": "Nachname",
    "form.birthDate": "Geburtsdatum",
    "form.email": "E-Mail",
    "form.phone": "Telefon",
    "form.membershipType": "Art der Mitgliedschaft",
    "form.leisure": "Freizeitmannschaft",
    "form.competitive": "Wettkampfmannschaft",
    "form.supporter": "Fördermitglied",
    "form.address": "Adresse",
    "form.postalCode": "Postleitzahl",
    "form.city": "Stadt",
    "form.experience": "Fußballerfahrung",
    "form.emergency": "Notfallkontakt",
    "form.fullName": "Vollständiger Name",
    "form.additional": "Zusätzliche Nachricht",
    "form.consent":
      "Ich stimme zu, dass meine Daten zur Bearbeitung meines Mitgliedsantrags verwendet werden.",
    "form.sending": "Wird gesendet…",
    "form.submit": "Anfrage senden",
    "form.error": "Ein Fehler ist aufgetreten.",

    "smart.kicker": "Intelligentes Formular",
    "smart.title": "Mitgliedsantrag",
    "smart.intro":
      "Das Formular passt sich automatisch an die gewählte Mitgliedsart an.",
    "smart.step": "Schritt",
    "smart.step.1": "Art",
    "smart.step.2": "Identität",
    "smart.step.3": "Profil",
    "smart.step.4": "Verfügbarkeit",
    "smart.step.5": "Bestätigung",
    "smart.choose": "Mitgliedsart auswählen",
    "smart.identity": "Persönliche Angaben",
    "smart.structure": "Angaben zur Organisation",
    "smart.close": "Schließen",
    "smart.back": "Zurück",
    "smart.next": "Weiter",

    "smart.type.sportif": "Sportmitglied",
    "smart.type.actif": "Aktives Mitglied",
    "smart.type.sympathisant": "Fördermitglied",
    "smart.type.benevole": "Ehrenamtliche Person",
    "smart.type.partenaire": "Partner / Sponsor",

    "smart.desc.sportif": "Wettkampf- oder Freizeitmannschaft.",
    "smart.desc.actif": "Aktiv am Vereinsleben teilnehmen.",
    "smart.desc.sympathisant": "Damba gelegentlich unterstützen.",
    "smart.desc.benevole": "Bei Veranstaltungen und Projekten helfen.",
    "smart.desc.partenaire":
      "Den Verein als Organisation unterstützen.",

    "smart.gender": "Geschlecht",
    "smart.man": "Männlich",
    "smart.woman": "Weiblich",
    "smart.other": "Andere",
    "smart.nationality": "Nationalität",
    "smart.profession": "Beruf",
    "smart.organisation": "Name des Unternehmens / der Organisation",
    "smart.sector": "Branche",
    "smart.website": "Webseite",

    "smart.profile.sportif": "Sportliches Profil",
    "smart.profile.actif": "Vereinsengagement",
    "smart.profile.sympathisant": "Art der Unterstützung",
    "smart.profile.benevole": "Hilfsbereiche",
    "smart.profile.partenaire": "Partnerschaftsprojekt",

    "smart.team": "Gewünschte Mannschaft",
    "smart.position": "Bevorzugte Position",
    "smart.level": "Aktuelles Niveau",
    "smart.formerClub": "Früherer Verein",
    "smart.involvement": "Wie möchten Sie sich engagieren?",
    "smart.skills": "Fähigkeiten oder Hilfsbereiche",
    "smart.partnership": "Beschreiben Sie die gewünschte Partnerschaft",
    "smart.availability": "Verfügbarkeit und Kontakt",
    "smart.availabilityPrompt":
      "Geben Sie Ihre übliche Verfügbarkeit an",
    "smart.validation": "Prüfung und Bestätigung",

    "smart.healthInsurance":
      "Verfügen Sie über eine gültige Krankenversicherung in Deutschland?",
    "smart.healthInsuranceHelp":
      "Diese Information wird nur für die Teilnahme am Sportbetrieb benötigt.",
    "smart.healthInsuranceYes": "Ja",
    "smart.healthInsuranceNo": "Nein",
    "smart.healthInsurancePending": "Wird derzeit geklärt",
  },
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isSupportedLanguage(value: string | null): value is Language {
  return value === "fr" || value === "en" || value === "de";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr");

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("damba-language");
    const browserLanguage = navigator.language?.slice(0, 2) ?? "";

    const nextLanguage: Language = isSupportedLanguage(savedLanguage)
      ? savedLanguage
      : isSupportedLanguage(browserLanguage)
        ? browserLanguage
        : "fr";

    setLanguageState(nextLanguage);
    document.documentElement.lang = nextLanguage;
  }, []);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem("damba-language", nextLanguage);
    document.documentElement.lang = nextLanguage;
  }, []);

  const t = useCallback(
    (key: string): string => {
      return dictionaries[language][key] ?? key;
    },
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used within a LanguageProvider",
    );
  }

  return context;
}