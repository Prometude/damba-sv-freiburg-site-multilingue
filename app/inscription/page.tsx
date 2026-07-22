"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useMemo,
  useState,
} from "react";

type FormData = {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  email: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  membershipType: string;
  footballLevel: string;
  position: string;
  motivation: string;
  emergencyName: string;
  emergencyPhone: string;
  healthInformation: string;
  acceptRules: boolean;
  acceptPrivacy: boolean;
  acceptPhotos: boolean;
};

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  birthDate: "",
  gender: "",
  email: "",
  phone: "",
  street: "",
  postalCode: "",
  city: "",
  membershipType: "",
  footballLevel: "",
  position: "",
  motivation: "",
  emergencyName: "",
  emergencyPhone: "",
  healthInformation: "",
  acceptRules: false,
  acceptPrivacy: false,
  acceptPhotos: false,
};

const steps = [
  {
    number: 1,
    title: "Identité",
  },
  {
    number: 2,
    title: "Contact",
  },
  {
    number: 3,
    title: "Football",
  },
  {
    number: 4,
    title: "Sécurité",
  },
  {
    number: 5,
    title: "Confirmation",
  },
];

export default function InscriptionPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = useMemo(() => {
    return Math.round((currentStep / steps.length) * 100);
  }, [currentStep]);

  function handleInputChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const target = event.target;
    const { name, value } = target;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setFormData((previousData) => ({
        ...previousData,
        [name]: target.checked,
      }));

      return;
    }

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function validateCurrentStep(): boolean {
    setErrorMessage("");

    if (
      currentStep === 1 &&
      (!formData.firstName ||
        !formData.lastName ||
        !formData.birthDate)
    ) {
      setErrorMessage(
        "Veuillez remplir le prénom, le nom et la date de naissance.",
      );

      return false;
    }

    if (
      currentStep === 2 &&
      (!formData.email ||
        !formData.phone ||
        !formData.street ||
        !formData.postalCode ||
        !formData.city)
    ) {
      setErrorMessage(
        "Veuillez remplir toutes les informations de contact obligatoires.",
      );

      return false;
    }

    if (
      currentStep === 3 &&
      (!formData.membershipType || !formData.footballLevel)
    ) {
      setErrorMessage(
        "Veuillez sélectionner le type d’adhésion et votre niveau de football.",
      );

      return false;
    }

    if (
      currentStep === 4 &&
      (!formData.emergencyName || !formData.emergencyPhone)
    ) {
      setErrorMessage(
        "Veuillez renseigner une personne à contacter en cas d’urgence.",
      );

      return false;
    }

    if (
      currentStep === 5 &&
      (!formData.acceptRules || !formData.acceptPrivacy)
    ) {
      setErrorMessage(
        "Vous devez accepter le règlement intérieur et la politique de confidentialité.",
      );

      return false;
    }

    return true;
  }

  function goToNextStep() {
    const isCurrentStepValid = validateCurrentStep();

    if (!isCurrentStepValid) {
      return;
    }

    setCurrentStep((previousStep) =>
      Math.min(previousStep + 1, steps.length),
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goToPreviousStep() {
    setErrorMessage("");

    setCurrentStep((previousStep) =>
      Math.max(previousStep - 1, 1),
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
            responseData?.error ||
            "Une erreur est survenue pendant l’inscription.",
        );
      }

      setSuccessMessage(
        "Votre inscription a été envoyée avec succès. Damba SV Freiburg vous contactera prochainement.",
      );

      setFormData(initialFormData);
      setCurrentStep(1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible d’envoyer le formulaire.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="registration-page">
      <div className="registration-container">
        <section className="registration-introduction">
          <span className="registration-badge">
            Damba SV Freiburg
          </span>

          <h1>Devenir membre</h1>

          <p>
            Remplissez le formulaire ci-dessous pour rejoindre notre
            communauté sportive.
          </p>

          <div className="training-information">
            <div>
              <span className="training-icon" aria-hidden="true">
                📅
              </span>

              <div>
                <strong>Entraînement</strong>
                <p>Chaque samedi de 17h00 à 19h00</p>
              </div>
            </div>

            <div>
              <span className="training-icon" aria-hidden="true">
                📍
              </span>

              <div>
                <strong>Lieu</strong>
                <p>
                  Schönbergstadion, Wiesentalstraße 2, 79115 Freiburg
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="registration-card">
          <div className="mobile-step-summary">
            <div className="mobile-step-heading">
              <span>
                Étape {currentStep} sur {steps.length}
              </span>

              <span>{progress} %</span>
            </div>

            <strong>{steps[currentStep - 1].title}</strong>

            <div className="progress-track">
              <div
                className="progress-bar"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          <div className="desktop-stepper">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`stepper-item ${
                  currentStep === step.number ? "is-active" : ""
                } ${
                  currentStep > step.number ? "is-completed" : ""
                }`}
              >
                <div className="stepper-number">
                  {currentStep > step.number ? "✓" : step.number}
                </div>

                <span>{step.title}</span>
              </div>
            ))}
          </div>

          {successMessage && (
            <div className="form-alert form-alert-success" role="status">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="form-alert form-alert-error" role="alert">
              {errorMessage}
            </div>
          )}

          <form
            className="registration-form"
            onSubmit={handleSubmit}
            noValidate
          >
            {currentStep === 1 && (
              <div className="form-step">
                <div className="form-step-heading">
                  <span>Étape 1</span>
                  <h2>Informations personnelles</h2>
                  <p>
                    Indiquez les informations principales concernant le
                    futur membre.
                  </p>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="firstName">
                      Prénom <span aria-hidden="true">*</span>
                    </label>

                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      autoComplete="given-name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">
                      Nom <span aria-hidden="true">*</span>
                    </label>

                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      autoComplete="family-name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="birthDate">
                      Date de naissance{" "}
                      <span aria-hidden="true">*</span>
                    </label>

                    <input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender">Genre</label>

                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Sélectionner</option>
                      <option value="homme">Homme</option>
                      <option value="femme">Femme</option>
                      <option value="autre">Autre</option>
                      <option value="non-indique">
                        Je préfère ne pas l’indiquer
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="form-step">
                <div className="form-step-heading">
                  <span>Étape 2</span>
                  <h2>Coordonnées</h2>
                  <p>
                    Ces informations permettront au club de vous contacter.
                  </p>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="email">
                      Adresse e-mail{" "}
                      <span aria-hidden="true">*</span>
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      autoComplete="email"
                      inputMode="email"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      Téléphone <span aria-hidden="true">*</span>
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="+49..."
                      required
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label htmlFor="street">
                      Rue et numéro{" "}
                      <span aria-hidden="true">*</span>
                    </label>

                    <input
                      id="street"
                      name="street"
                      type="text"
                      value={formData.street}
                      onChange={handleInputChange}
                      autoComplete="street-address"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="postalCode">
                      Code postal <span aria-hidden="true">*</span>
                    </label>

                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      autoComplete="postal-code"
                      inputMode="numeric"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">
                      Ville <span aria-hidden="true">*</span>
                    </label>

                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleInputChange}
                      autoComplete="address-level2"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="form-step">
                <div className="form-step-heading">
                  <span>Étape 3</span>
                  <h2>Profil sportif</h2>
                  <p>
                    Présentez votre expérience et le type d’équipe que vous
                    souhaitez rejoindre.
                  </p>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="membershipType">
                      Type d’adhésion{" "}
                      <span aria-hidden="true">*</span>
                    </label>

                    <select
                      id="membershipType"
                      name="membershipType"
                      value={formData.membershipType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Sélectionner</option>
                      <option value="loisir">Équipe loisirs</option>
                      <option value="competitive">
                        Équipe compétitive
                      </option>
                      <option value="soutien">
                        Membre de soutien
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="footballLevel">
                      Niveau de football{" "}
                      <span aria-hidden="true">*</span>
                    </label>

                    <select
                      id="footballLevel"
                      name="footballLevel"
                      value={formData.footballLevel}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Sélectionner</option>
                      <option value="debutant">Débutant</option>
                      <option value="intermediaire">
                        Intermédiaire
                      </option>
                      <option value="avance">Avancé</option>
                      <option value="competition">
                        Expérience en compétition
                      </option>
                    </select>
                  </div>

                  <div className="form-group form-group-full">
                    <label htmlFor="position">
                      Poste préféré
                    </label>

                    <select
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                    >
                      <option value="">Sélectionner</option>
                      <option value="gardien">Gardien</option>
                      <option value="defenseur">Défenseur</option>
                      <option value="milieu">Milieu de terrain</option>
                      <option value="attaquant">Attaquant</option>
                      <option value="polyvalent">Polyvalent</option>
                    </select>
                  </div>

                  <div className="form-group form-group-full">
                    <label htmlFor="motivation">
                      Pourquoi souhaitez-vous rejoindre Damba ?
                    </label>

                    <textarea
                      id="motivation"
                      name="motivation"
                      value={formData.motivation}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Présentez brièvement votre motivation..."
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="form-step">
                <div className="form-step-heading">
                  <span>Étape 4</span>
                  <h2>Sécurité et urgence</h2>
                  <p>
                    Indiquez une personne que le club peut contacter en cas
                    d’urgence.
                  </p>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="emergencyName">
                      Nom de la personne à contacter{" "}
                      <span aria-hidden="true">*</span>
                    </label>

                    <input
                      id="emergencyName"
                      name="emergencyName"
                      type="text"
                      value={formData.emergencyName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="emergencyPhone">
                      Téléphone d’urgence{" "}
                      <span aria-hidden="true">*</span>
                    </label>

                    <input
                      id="emergencyPhone"
                      name="emergencyPhone"
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={handleInputChange}
                      inputMode="tel"
                      required
                    />
                  </div>

                  <div className="form-group form-group-full">
                    <label htmlFor="healthInformation">
                      Informations importantes pour la pratique sportive
                    </label>

                    <textarea
                      id="healthInformation"
                      name="healthInformation"
                      value={formData.healthInformation}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Informations utiles à communiquer au club..."
                    />

                    <p className="field-help">
                      Ne communiquez que les informations strictement
                      nécessaires à la sécurité pendant les activités.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="form-step">
                <div className="form-step-heading">
                  <span>Étape 5</span>
                  <h2>Validation de l’inscription</h2>
                  <p>
                    Vérifiez vos informations et acceptez les conditions
                    nécessaires.
                  </p>
                </div>

                <div className="registration-summary">
                  <div>
                    <span>Nom complet</span>
                    <strong>
                      {formData.firstName} {formData.lastName}
                    </strong>
                  </div>

                  <div>
                    <span>E-mail</span>
                    <strong>{formData.email}</strong>
                  </div>

                  <div>
                    <span>Téléphone</span>
                    <strong>{formData.phone}</strong>
                  </div>

                  <div>
                    <span>Type d’adhésion</span>
                    <strong>
                      {formData.membershipType || "Non indiqué"}
                    </strong>
                  </div>
                </div>

                <div className="consent-list">
                  <label className="checkbox-field">
                    <input
                      type="checkbox"
                      name="acceptRules"
                      checked={formData.acceptRules}
                      onChange={handleInputChange}
                      required
                    />

                    <span>
                      J’accepte le règlement intérieur et la charte de Damba
                      SV Freiburg. *
                    </span>
                  </label>

                  <label className="checkbox-field">
                    <input
                      type="checkbox"
                      name="acceptPrivacy"
                      checked={formData.acceptPrivacy}
                      onChange={handleInputChange}
                      required
                    />

                    <span>
                      J’ai lu et j’accepte la{" "}
                      <Link href="/datenschutz">
                        politique de confidentialité
                      </Link>
                      . *
                    </span>
                  </label>

                  <label className="checkbox-field">
                    <input
                      type="checkbox"
                      name="acceptPhotos"
                      checked={formData.acceptPhotos}
                      onChange={handleInputChange}
                    />

                    <span>
                      J’autorise le club à utiliser des photos prises pendant
                      les activités, selon les conditions communiquées par le
                      club.
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="form-navigation">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={goToPreviousStep}
                  disabled={isSubmitting}
                >
                  Précédent
                </button>
              )}

              {currentStep < steps.length ? (
                <button
                  type="button"
                  className="button button-primary button-next"
                  onClick={goToNextStep}
                >
                  Continuer
                </button>
              ) : (
                <button
                  type="submit"
                  className="button button-primary button-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Envoi en cours..."
                    : "Envoyer mon inscription"}
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
