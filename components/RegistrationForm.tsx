"use client";

import { FormEvent, useState } from "react";

type FormDataType = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  address: string;
  postalCode: string;
  city: string;
  membershipType: string;
  message: string;
  privacyAccepted: boolean;
};

const initialFormData: FormDataType = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: "",
  address: "",
  postalCode: "",
  city: "",
  membershipType: "",
  message: "",
  privacyAccepted: false,
};

export default function RegistrationForm() {
  const [formData, setFormData] =
    useState<FormDataType>(initialFormData);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) {
    const { name, value, type } = event.target;

    const checked =
      type === "checkbox"
        ? (event.target as HTMLInputElement).checked
        : undefined;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!formData.privacyAccepted) {
      setErrorMessage(
        "Vous devez accepter la politique de confidentialité."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "L’inscription n’a pas pu être enregistrée."
        );
      }

      setSuccessMessage(
        "Votre inscription a bien été envoyée. Damba SV Freiburg vous contactera prochainement."
      );

      setFormData(initialFormData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Informations personnelles
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Les champs marqués d’un astérisque sont obligatoires.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="mb-2 block font-medium text-gray-800"
          >
            Prénom *
          </label>

          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleChange}
            required
            autoComplete="given-name"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="mb-2 block font-medium text-gray-800"
          >
            Nom *
          </label>

          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleChange}
            required
            autoComplete="family-name"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block font-medium text-gray-800"
          >
            Adresse e-mail *
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-2 block font-medium text-gray-800"
          >
            Téléphone *
          </label>

          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
            autoComplete="tel"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label
            htmlFor="birthDate"
            className="mb-2 block font-medium text-gray-800"
          >
            Date de naissance *
          </label>

          <input
            id="birthDate"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label
            htmlFor="membershipType"
            className="mb-2 block font-medium text-gray-800"
          >
            Type d’inscription *
          </label>

          <select
            id="membershipType"
            name="membershipType"
            value={formData.membershipType}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
          >
            <option value="">Sélectionner</option>
            <option value="loisir">Équipe loisir</option>
            <option value="competitive">Équipe compétitive</option>
            <option value="benevole">Bénévole</option>
            <option value="sympathisant">Membre sympathisant</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="address"
            className="mb-2 block font-medium text-gray-800"
          >
            Adresse *
          </label>

          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            required
            autoComplete="street-address"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label
            htmlFor="postalCode"
            className="mb-2 block font-medium text-gray-800"
          >
            Code postal *
          </label>

          <input
            id="postalCode"
            name="postalCode"
            type="text"
            value={formData.postalCode}
            onChange={handleChange}
            required
            autoComplete="postal-code"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label
            htmlFor="city"
            className="mb-2 block font-medium text-gray-800"
          >
            Ville *
          </label>

          <input
            id="city"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleChange}
            required
            autoComplete="address-level2"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="message"
            className="mb-2 block font-medium text-gray-800"
          >
            Message ou information complémentaire
          </label>

          <textarea
            id="message"
            name="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
          />
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
        <input
          name="privacyAccepted"
          type="checkbox"
          checked={formData.privacyAccepted}
          onChange={handleChange}
          required
          className="mt-1 h-5 w-5"
        />

        <span className="text-sm text-gray-700">
          J’accepte que mes informations soient utilisées pour traiter ma
          demande d’inscription conformément à la politique de confidentialité.
        </span>
      </label>

      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
        >
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
        >
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-green-800 px-6 py-4 font-semibold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
      >
        {isSubmitting
          ? "Enregistrement en cours..."
          : "Envoyer mon inscription"}
      </button>
    </form>
  );
}
