import type { Metadata } from "next";

import RegistrationPageClient from "../../components/RegistrationPageClient";

export const metadata: Metadata = {
  title: "Devenir membre | Damba SV Freiburg",
  description:
    "Formulaire officiel d’inscription à Damba SV Freiburg.",
};

export default function RegistrationPage() {
  return <RegistrationPageClient />;
}
