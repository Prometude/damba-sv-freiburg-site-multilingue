import type {
  Language,
} from "../components/LanguageProvider";

export type MemberTranslationKey =
  | "common.notDefined"
  | "common.notAssigned"
  | "common.loading"
  | "common.cancel"
  | "auth.secureArea"
  | "auth.memberArea"
  | "auth.loginTitle"
  | "auth.loginIntro"
  | "auth.email"
  | "auth.password"
  | "auth.showPassword"
  | "auth.loggingIn"
  | "auth.login"
  | "auth.activated"
  | "auth.loginFailed"
  | "auth.genericError"
  | "auth.backPublic"
  | "activation.title"
  | "activation.intro"
  | "activation.newPassword"
  | "activation.confirmPassword"
  | "activation.passwordHelp"
  | "activation.activating"
  | "activation.activate"
  | "activation.incompleteLink"
  | "activation.failed"
  | "activation.success"
  | "activation.backLogin"
  | "dashboard.memberArea"
  | "dashboard.welcome"
  | "dashboard.memberNumber"
  | "dashboard.logout"
  | "dashboard.limitedWarning"
  | "dashboard.membership"
  | "dashboard.contribution"
  | "dashboard.validUntil"
  | "dashboard.role"
  | "dashboard.personalSituation"
  | "dashboard.financialSummary"
  | "dashboard.viewDetails"
  | "dashboard.totalDue"
  | "dashboard.contributionsDue"
  | "dashboard.sanctionsDamage"
  | "dashboard.profile"
  | "dashboard.profileText"
  | "dashboard.finances"
  | "dashboard.financesText"
  | "dashboard.training"
  | "dashboard.trainingText"
  | "dashboard.documents"
  | "dashboard.documentsText"
  | "dashboard.news"
  | "dashboard.newsText"
  | "dashboard.care"
  | "dashboard.careText"
  | "finance.contest"
  | "finance.contestReason"
  | "finance.contestPlaceholder"
  | "finance.sendContest"
  | "finance.sending"
  | "finance.contestPending"
  | "finance.contestSuccess"
  | "finance.contestFailed";

const dictionaries:
  Record<
    Language,
    Record<MemberTranslationKey, string>
  > = {
  fr: {
    "common.notDefined": "Non définie",
    "common.notAssigned": "Non attribué",
    "common.loading": "Chargement…",
    "common.cancel": "Annuler",

    "auth.secureArea": "Espace sécurisé",
    "auth.memberArea": "Espace membre",
    "auth.loginTitle": "Connexion membre",
    "auth.loginIntro":
      "Cet espace est réservé aux membres validés et en règle de Damba SV Freiburg.",
    "auth.email": "Adresse e-mail",
    "auth.password": "Mot de passe",
    "auth.showPassword":
      "Afficher le mot de passe",
    "auth.loggingIn": "Connexion…",
    "auth.login": "Se connecter",
    "auth.activated":
      "Votre compte a été activé. Vous pouvez maintenant vous connecter.",
    "auth.loginFailed":
      "Connexion impossible.",
    "auth.genericError":
      "Une erreur est survenue.",
    "auth.backPublic":
      "Retour au site public",

    "activation.title":
      "Activez votre compte",
    "activation.intro":
      "Créez votre mot de passe personnel afin d’accéder aux services réservés aux membres de Damba SV Freiburg.",
    "activation.newPassword":
      "Nouveau mot de passe",
    "activation.confirmPassword":
      "Confirmer le mot de passe",
    "activation.passwordHelp":
      "Le mot de passe doit contenir au moins 10 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.",
    "activation.activating":
      "Activation…",
    "activation.activate":
      "Activer mon compte",
    "activation.incompleteLink":
      "Le lien d’activation est incomplet.",
    "activation.failed":
      "L’activation a échoué.",
    "activation.success":
      "Votre compte a été activé.",
    "activation.backLogin":
      "Retour à la connexion",

    "dashboard.memberArea":
      "Espace membre",
    "dashboard.welcome":
      "Bienvenue",
    "dashboard.memberNumber":
      "Numéro de membre",
    "dashboard.logout":
      "Se déconnecter",
    "dashboard.limitedWarning":
      "Votre accès est actuellement limité. Certaines fonctionnalités resteront indisponibles jusqu’à la régularisation de votre situation.",
    "dashboard.membership":
      "Adhésion",
    "dashboard.contribution":
      "Cotisation",
    "dashboard.validUntil":
      "Valable jusqu’au",
    "dashboard.role": "Rôle",
    "dashboard.personalSituation":
      "Situation personnelle",
    "dashboard.financialSummary":
      "Bilan financier",
    "dashboard.viewDetails":
      "Voir le détail",
    "dashboard.totalDue":
      "Solde total dû",
    "dashboard.contributionsDue":
      "Cotisations dues",
    "dashboard.sanctionsDamage":
      "Sanctions et dommages",
    "dashboard.profile":
      "Mon profil",
    "dashboard.profileText":
      "Consulter mes informations",
    "dashboard.finances":
      "Mes finances",
    "dashboard.financesText":
      "Cotisations, sanctions et reçus",
    "dashboard.training":
      "Entraînements",
    "dashboard.trainingText":
      "Présences et historique",
    "dashboard.documents":
      "Documents",
    "dashboard.documentsText":
      "Documents réservés aux membres",
    "dashboard.news":
      "Actualités internes",
    "dashboard.newsText":
      "Informations du club",
    "dashboard.care": "Damba Care",
    "dashboard.careText":
      "Demande confidentielle",

    "finance.contest":
      "Contester cette écriture",
    "finance.contestReason":
      "Motif de la contestation",
    "finance.contestPlaceholder":
      "Expliquez précisément la raison de votre contestation.",
    "finance.sendContest":
      "Envoyer la contestation",
    "finance.sending": "Envoi…",
    "finance.contestPending":
      "Contestation en cours",
    "finance.contestSuccess":
      "Votre contestation a été enregistrée.",
    "finance.contestFailed":
      "La contestation n’a pas pu être envoyée.",
  },

  en: {
    "common.notDefined": "Not specified",
    "common.notAssigned": "Not assigned",
    "common.loading": "Loading…",
    "common.cancel": "Cancel",

    "auth.secureArea": "Secure area",
    "auth.memberArea": "Member area",
    "auth.loginTitle": "Member login",
    "auth.loginIntro":
      "This area is reserved for approved Damba SV Freiburg members whose membership is in good standing.",
    "auth.email": "Email address",
    "auth.password": "Password",
    "auth.showPassword":
      "Show password",
    "auth.loggingIn": "Signing in…",
    "auth.login": "Sign in",
    "auth.activated":
      "Your account has been activated. You may now sign in.",
    "auth.loginFailed":
      "Unable to sign in.",
    "auth.genericError":
      "An error occurred.",
    "auth.backPublic":
      "Back to the public website",

    "activation.title":
      "Activate your account",
    "activation.intro":
      "Create your personal password to access the services reserved for Damba SV Freiburg members.",
    "activation.newPassword":
      "New password",
    "activation.confirmPassword":
      "Confirm password",
    "activation.passwordHelp":
      "The password must contain at least 10 characters, one uppercase letter, one lowercase letter, one number and one special character.",
    "activation.activating":
      "Activating…",
    "activation.activate":
      "Activate my account",
    "activation.incompleteLink":
      "The activation link is incomplete.",
    "activation.failed":
      "Account activation failed.",
    "activation.success":
      "Your account has been activated.",
    "activation.backLogin":
      "Back to login",

    "dashboard.memberArea":
      "Member area",
    "dashboard.welcome":
      "Welcome",
    "dashboard.memberNumber":
      "Member number",
    "dashboard.logout":
      "Sign out",
    "dashboard.limitedWarning":
      "Your access is currently limited. Some features will remain unavailable until your situation has been regularised.",
    "dashboard.membership":
      "Membership",
    "dashboard.contribution":
      "Membership fee",
    "dashboard.validUntil":
      "Valid until",
    "dashboard.role": "Role",
    "dashboard.personalSituation":
      "Personal account",
    "dashboard.financialSummary":
      "Financial summary",
    "dashboard.viewDetails":
      "View details",
    "dashboard.totalDue":
      "Total balance due",
    "dashboard.contributionsDue":
      "Membership fees due",
    "dashboard.sanctionsDamage":
      "Sanctions and damages",
    "dashboard.profile":
      "My profile",
    "dashboard.profileText":
      "View my personal information",
    "dashboard.finances":
      "My finances",
    "dashboard.financesText":
      "Fees, sanctions and receipts",
    "dashboard.training":
      "Training",
    "dashboard.trainingText":
      "Attendance and history",
    "dashboard.documents":
      "Documents",
    "dashboard.documentsText":
      "Members-only documents",
    "dashboard.news":
      "Internal news",
    "dashboard.newsText":
      "Club information",
    "dashboard.care": "Damba Care",
    "dashboard.careText":
      "Confidential request",

    "finance.contest":
      "Contest this entry",
    "finance.contestReason":
      "Reason for the contestation",
    "finance.contestPlaceholder":
      "Explain precisely why you are contesting this entry.",
    "finance.sendContest":
      "Submit contestation",
    "finance.sending": "Sending…",
    "finance.contestPending":
      "Contestation under review",
    "finance.contestSuccess":
      "Your contestation has been submitted.",
    "finance.contestFailed":
      "The contestation could not be submitted.",
  },

  de: {
    "common.notDefined":
      "Nicht festgelegt",
    "common.notAssigned":
      "Nicht vergeben",
    "common.loading": "Wird geladen…",
    "common.cancel": "Abbrechen",

    "auth.secureArea":
      "Geschützter Bereich",
    "auth.memberArea":
      "Mitgliederbereich",
    "auth.loginTitle":
      "Mitgliederanmeldung",
    "auth.loginIntro":
      "Dieser Bereich ist ausschließlich für bestätigte und ordnungsgemäß registrierte Mitglieder von Damba SV Freiburg bestimmt.",
    "auth.email": "E-Mail-Adresse",
    "auth.password": "Passwort",
    "auth.showPassword":
      "Passwort anzeigen",
    "auth.loggingIn":
      "Anmeldung läuft…",
    "auth.login": "Anmelden",
    "auth.activated":
      "Ihr Konto wurde aktiviert. Sie können sich jetzt anmelden.",
    "auth.loginFailed":
      "Die Anmeldung ist nicht möglich.",
    "auth.genericError":
      "Ein Fehler ist aufgetreten.",
    "auth.backPublic":
      "Zurück zur öffentlichen Website",

    "activation.title":
      "Konto aktivieren",
    "activation.intro":
      "Erstellen Sie Ihr persönliches Passwort, um auf die für Mitglieder von Damba SV Freiburg reservierten Dienste zuzugreifen.",
    "activation.newPassword":
      "Neues Passwort",
    "activation.confirmPassword":
      "Passwort bestätigen",
    "activation.passwordHelp":
      "Das Passwort muss mindestens 10 Zeichen, einen Großbuchstaben, einen Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten.",
    "activation.activating":
      "Aktivierung läuft…",
    "activation.activate":
      "Mein Konto aktivieren",
    "activation.incompleteLink":
      "Der Aktivierungslink ist unvollständig.",
    "activation.failed":
      "Die Aktivierung ist fehlgeschlagen.",
    "activation.success":
      "Ihr Konto wurde aktiviert.",
    "activation.backLogin":
      "Zurück zur Anmeldung",

    "dashboard.memberArea":
      "Mitgliederbereich",
    "dashboard.welcome":
      "Willkommen",
    "dashboard.memberNumber":
      "Mitgliedsnummer",
    "dashboard.logout":
      "Abmelden",
    "dashboard.limitedWarning":
      "Ihr Zugang ist derzeit eingeschränkt. Einige Funktionen bleiben bis zur Klärung Ihrer Situation nicht verfügbar.",
    "dashboard.membership":
      "Mitgliedschaft",
    "dashboard.contribution":
      "Mitgliedsbeitrag",
    "dashboard.validUntil":
      "Gültig bis",
    "dashboard.role": "Rolle",
    "dashboard.personalSituation":
      "Persönliche Situation",
    "dashboard.financialSummary":
      "Finanzübersicht",
    "dashboard.viewDetails":
      "Details anzeigen",
    "dashboard.totalDue":
      "Offener Gesamtbetrag",
    "dashboard.contributionsDue":
      "Offene Mitgliedsbeiträge",
    "dashboard.sanctionsDamage":
      "Sanktionen und Schäden",
    "dashboard.profile":
      "Mein Profil",
    "dashboard.profileText":
      "Meine persönlichen Daten anzeigen",
    "dashboard.finances":
      "Meine Finanzen",
    "dashboard.financesText":
      "Beiträge, Sanktionen und Belege",
    "dashboard.training":
      "Training",
    "dashboard.trainingText":
      "Anwesenheit und Verlauf",
    "dashboard.documents":
      "Dokumente",
    "dashboard.documentsText":
      "Dokumente nur für Mitglieder",
    "dashboard.news":
      "Interne Nachrichten",
    "dashboard.newsText":
      "Informationen des Vereins",
    "dashboard.care": "Damba Care",
    "dashboard.careText":
      "Vertrauliche Anfrage",

    "finance.contest":
      "Diesen Eintrag anfechten",
    "finance.contestReason":
      "Grund der Anfechtung",
    "finance.contestPlaceholder":
      "Erläutern Sie genau, warum Sie diesen Eintrag anfechten.",
    "finance.sendContest":
      "Anfechtung absenden",
    "finance.sending":
      "Wird gesendet…",
    "finance.contestPending":
      "Anfechtung wird geprüft",
    "finance.contestSuccess":
      "Ihre Anfechtung wurde übermittelt.",
    "finance.contestFailed":
      "Die Anfechtung konnte nicht übermittelt werden.",
  },
};

export function getMemberText(
  language: Language,
  key: MemberTranslationKey
) {
  return (
    dictionaries[language]?.[key] ??
    dictionaries.fr[key]
  );
}

export function getMemberLocale(
  language: Language
) {
  if (language === "de") {
    return "de-DE";
  }

  if (language === "en") {
    return "en-GB";
  }

  return "fr-FR";
}

const valueLabels = {
  membershipStatus: {
    pending: {
      fr: "En attente",
      en: "Pending",
      de: "Ausstehend",
    },
    active: {
      fr: "Active",
      en: "Active",
      de: "Aktiv",
    },
    limited: {
      fr: "Limitée",
      en: "Limited",
      de: "Eingeschränkt",
    },
    suspended: {
      fr: "Suspendue",
      en: "Suspended",
      de: "Gesperrt",
    },
    inactive: {
      fr: "Inactive",
      en: "Inactive",
      de: "Inaktiv",
    },
    terminated: {
      fr: "Terminée",
      en: "Terminated",
      de: "Beendet",
    },
  },

  contributionStatus: {
    paid: {
      fr: "À jour",
      en: "Paid",
      de: "Bezahlt",
    },
    unpaid: {
      fr: "Non réglée",
      en: "Unpaid",
      de: "Nicht bezahlt",
    },
    overdue: {
      fr: "En retard",
      en: "Overdue",
      de: "Überfällig",
    },
    exempt: {
      fr: "Exonérée",
      en: "Exempt",
      de: "Befreit",
    },
    grace_period: {
      fr: "Période de tolérance",
      en: "Grace period",
      de: "Kulanzfrist",
    },
  },

  role: {
    member: {
      fr: "Membre",
      en: "Member",
      de: "Mitglied",
    },
    player: {
      fr: "Joueur",
      en: "Player",
      de: "Spieler",
    },
    coach: {
      fr: "Entraîneur",
      en: "Coach",
      de: "Trainer",
    },
    committee: {
      fr: "Comité",
      en: "Committee",
      de: "Vorstand / Ausschuss",
    },
    treasurer: {
      fr: "Trésorier",
      en: "Treasurer",
      de: "Kassenwart",
    },
    admin: {
      fr: "Administrateur",
      en: "Administrator",
      de: "Administrator",
    },
  },
} as const;

export function getMemberValueLabel(
  group:
    | "membershipStatus"
    | "contributionStatus"
    | "role",
  value: string,
  language: Language
) {
  const groupValues =
    valueLabels[group] as Record<
      string,
      Record<Language, string>
    >;

  return (
    groupValues[value]?.[language] ??
    value
  );
}
