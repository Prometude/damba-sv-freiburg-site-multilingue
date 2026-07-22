import Link from "next/link";
import RegistrationForm from "@/components/RegistrationForm";

export const metadata = {
  title: "Inscription | Damba SV Freiburg",
  description:
    "Formulaire officiel d’inscription et d’adhésion à Damba SV Freiburg.",
};

export default function InscriptionPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-green-900 px-4 py-12 text-white">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-green-100 hover:text-white"
          >
            ← Retour à l’accueil
          </Link>

          <h1 className="text-3xl font-bold md:text-5xl">
            Inscription à Damba SV Freiburg
          </h1>

          <p className="mt-4 max-w-2xl text-green-100">
            Remplissez le formulaire ci-dessous pour demander votre inscription
            ou votre adhésion à Damba SV Freiburg.
          </p>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-5 shadow-lg md:p-10">
          <RegistrationForm />
        </div>
      </section>
    </main>
  );
}
