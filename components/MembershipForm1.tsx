"use client";

import {
  ChangeEvent,
  FormEvent,
  useState,
} from "react";

type MembershipFormData = {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  membershipType: string;
  footballLevel: string;
  preferredPosition: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  message: string;
  privacyAccepted: boolean;
  rulesAccepted: boolean;
};

const initialFormData: MembershipFormData = {
  firstName: "",
  lastName: "",
  birthDate: "",
  email: "",
  phone: "",
  street: "",
  postalCode: "",
  city: "",
  membershipType: "",
  footballLevel: "",
  preferredPosition: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  message: "",
  privacyAccepted: false,
  rulesAccepted: false,
};

export default function MembershipForm() {
  const [formData, setFormData] =
    useState<MembershipFormData>(initialFormData);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement |
      HTMLTextAreaElement
    >
  ) {
    const { name, value, type } = event.target;

    const newValue =
      type === "checkbox"
        ? (event.target as HTMLInputElement).checked
        : value;

    setFormData((currentData) => ({
      ...currentData,
      [name]: newValue,
    }));
  }

  function validateForm() {
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim()
    ) {
      return "Veuillez renseigner votre prénom et votre nom.";
    }

    if (
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      return "Veuillez renseigner votre adresse e-mail et votre téléphone.";
    }

    if (!formData.membershipType) {
      return "Veuillez sélectionner un type d’adhésion.";
    }

    if (!formData.privacyAccepted) {
      return "Vous devez accepter la politique de confidentialité.";
    }

    if (!formData.rulesAccepted) {
      return "Vous devez accepter les règles de Damba SV Freiburg.";
    }

    return "";
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
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

      let result: {
        message?: string;
        error?: string;
      } = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
          result.message ||
          "L’inscription n’a pas pu être enregistrée."
        );
      }

      setSuccessMessage(
        result.message ||
        "Votre demande d’inscription a bien été enregistrée. Damba SV Freiburg vous contactera prochainement."
      );

      setFormData(initialFormData);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue pendant l’inscription."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="membership-form"
      onSubmit={handleSubmit}
      noValidate
    >
      {successMessage && (
        <div
          className="membership-alert membership-alert-success"
          role="status"
          aria-live="polite"
        >
          <strong>Inscription envoyée</strong>
          <p>{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div
          className="membership-alert membership-alert-error"
          role="alert"
        >
          <strong>Veuillez vérifier le formulaire</strong>
          <p>{errorMessage}</p>
        </div>
      )}

      <section className="membership-form-section">
        <div className="membership-section-heading">
          <span>01</span>

          <div>
            <h2>Informations personnelles</h2>
            <p>
              Renseignez les informations principales du
              futur membre.
            </p>
          </div>
        </div>

        <div className="membership-form-grid">
          <div className="membership-field">
            <label htmlFor="firstName">
              Prénom <span aria-hidden="true">*</span>
            </label>

            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              autoComplete="given-name"
              required
            />
          </div>

          <div className="membership-field">
            <label htmlFor="lastName">
              Nom <span aria-hidden="true">*</span>
            </label>

            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              autoComplete="family-name"
              required
            />
          </div>

          <div className="membership-field">
            <label htmlFor="birthDate">
              Date de naissance
            </label>

            <input
              id="birthDate"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
            />
          </div>

          <div className="membership-field">
            <label htmlFor="membershipType">
              Type d’adhésion{" "}
              <span aria-hidden="true">*</span>
            </label>

            <select
              id="membershipType"
              name="membershipType"
              value={formData.membershipType}
              onChange={handleChange}
              required
            >
              <option value="">
                Sélectionner une option
              </option>

              <option value="loisir">
                Équipe loisir
              </option>

              <option value="competitive">
                Équipe compétitive
              </option>

              <option value="supporter">
                Membre sympathisant
              </option>

              <option value="volunteer">
                Bénévole
              </option>
            </select>
          </div>
        </div>
      </section>

      <section className="membership-form-section">
        <div className="membership-section-heading">
          <span>02</span>

          <div>
            <h2>Coordonnées</h2>
            <p>
              Ces informations permettent au club de vous
              contacter.
            </p>
          </div>
        </div>

        <div className="membership-form-grid">
          <div className="membership-field">
            <label htmlFor="email">
              Adresse e-mail{" "}
              <span aria-hidden="true">*</span>
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              inputMode="email"
              required
            />
          </div>

          <div className="membership-field">
            <label htmlFor="phone">
              Téléphone <span aria-hidden="true">*</span>
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
              inputMode="tel"
              required
            />
          </div>

          <div className="membership-field membership-field-full">
            <label htmlFor="street">
              Rue et numéro
            </label>

            <input
              id="street"
              name="street"
              type="text"
              value={formData.street}
              onChange={handleChange}
              autoComplete="street-address"
            />
          </div>

          <div className="membership-field">
            <label htmlFor="postalCode">
              Code postal
            </label>

            <input
              id="postalCode"
              name="postalCode"
              type="text"
              value={formData.postalCode}
              onChange={handleChange}
              autoComplete="postal-code"
              inputMode="numeric"
            />
          </div>

          <div className="membership-field">
            <label htmlFor="city">Ville</label>

            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleChange}
              autoComplete="address-level2"
            />
          </div>
        </div>
      </section>

      <section className="membership-form-section">
        <div className="membership-section-heading">
          <span>03</span>

          <div>
            <h2>Profil sportif</h2>
            <p>
              Ces renseignements nous aident à mieux vous
              orienter.
            </p>
          </div>
        </div>

        <div className="membership-form-grid">
          <div className="membership-field">
            <label htmlFor="footballLevel">
              Niveau de football
            </label>

            <select
              id="footballLevel"
              name="footballLevel"
              value={formData.footballLevel}
              onChange={handleChange}
            >
              <option value="">
                Sélectionner votre niveau
              </option>

              <option value="beginner">
                Débutant
              </option>

              <option value="leisure">
                Loisir
              </option>

              <option value="intermediate">
                Intermédiaire
              </option>

              <option value="advanced">
                Avancé
              </option>

              <option value="competitive">
                Compétition
              </option>
            </select>
          </div>

          <div className="membership-field">
            <label htmlFor="preferredPosition">
              Poste préféré
            </label>

            <select
              id="preferredPosition"
              name="preferredPosition"
              value={formData.preferredPosition}
              onChange={handleChange}
            >
              <option value="">
                Sélectionner un poste
              </option>

              <option value="goalkeeper">
                Gardien
              </option>

              <option value="defender">
                Défenseur
              </option>

              <option value="midfielder">
                Milieu de terrain
              </option>

              <option value="forward">
                Attaquant
              </option>

              <option value="versatile">
                Polyvalent
              </option>
            </select>
          </div>
        </div>
      </section>

      <section className="membership-form-section">
        <div className="membership-section-heading">
          <span>04</span>

          <div>
            <h2>Contact d’urgence</h2>
            <p>
              Une personne à contacter en cas de nécessité.
            </p>
          </div>
        </div>

        <div className="membership-form-grid">
          <div className="membership-field">
            <label htmlFor="emergencyContactName">
              Nom du contact
            </label>

            <input
              id="emergencyContactName"
              name="emergencyContactName"
              type="text"
              value={formData.emergencyContactName}
              onChange={handleChange}
            />
          </div>

          <div className="membership-field">
            <label htmlFor="emergencyContactPhone">
              Téléphone du contact
            </label>

            <input
              id="emergencyContactPhone"
              name="emergencyContactPhone"
              type="tel"
              value={formData.emergencyContactPhone}
              onChange={handleChange}
              inputMode="tel"
            />
          </div>

          <div className="membership-field membership-field-full">
            <label htmlFor="message">
              Informations complémentaires
            </label>

            <textarea
              id="message"
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              placeholder="Présentez brièvement votre motivation, vos disponibilités ou toute information utile."
            />
          </div>
        </div>
      </section>

      <section className="membership-form-section">
        <div className="membership-section-heading">
          <span>05</span>

          <div>
            <h2>Consentements</h2>
            <p>
              Veuillez confirmer les conditions nécessaires
              à l’inscription.
            </p>
          </div>
        </div>

        <div className="membership-consents">
          <label className="membership-checkbox">
            <input
              name="privacyAccepted"
              type="checkbox"
              checked={formData.privacyAccepted}
              onChange={handleChange}
              required
            />

            <span>
              J’accepte que mes données soient utilisées
              pour traiter ma demande d’adhésion conformément
              à la politique de confidentialité.
            </span>
          </label>

          <label className="membership-checkbox">
            <input
              name="rulesAccepted"
              type="checkbox"
              checked={formData.rulesAccepted}
              onChange={handleChange}
              required
            />

            <span>
              Je confirme avoir pris connaissance des règles,
              des valeurs et des obligations applicables aux
              membres de Damba SV Freiburg.
            </span>
          </label>
        </div>
      </section>

      <div className="membership-submit-area">
        <p>
          Les champs accompagnés d’un astérisque sont
          obligatoires.
        </p>

        <button
          className="membership-submit-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Enregistrement en cours…"
            : "Envoyer ma demande d’inscription"}
        </button>
      </div>
    </form>
  );
}
