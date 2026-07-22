"use client";

import {
  ChangeEvent,
  FormEvent,
  useState,
} from "react";

import { useLanguage } from "./LanguageProvider";

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
  const { t } = useLanguage();

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
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
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
      return t("membership.error.name");
    }

    if (!formData.birthDate) {
      return t("membership.error.birthDate");
    }

    if (
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      return t("membership.error.contact");
    }

    if (!formData.membershipType) {
      return t("membership.error.type");
    }

    if (!formData.privacyAccepted) {
      return t("membership.error.privacy");
    }

    if (!formData.rulesAccepted) {
      return t("membership.error.rules");
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

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

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
            t("membership.error.server")
        );
      }

      setSuccessMessage(
        result.message ||
          t("membership.success.message")
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
          : t("membership.error.server")
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
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
          <strong>
            {t("membership.success.title")}
          </strong>

          <p>{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div
          className="membership-alert membership-alert-error"
          role="alert"
        >
          <strong>
            {t("membership.error.title")}
          </strong>

          <p>{errorMessage}</p>
        </div>
      )}

      <section className="membership-form-section">
        <div className="membership-section-heading">
          <span>01</span>

          <div>
            <h2>
              {t("membership.personal.title")}
            </h2>

            <p>
              {t("membership.personal.description")}
            </p>
          </div>
        </div>

        <div className="membership-form-grid">
          <div className="membership-field">
            <label htmlFor="firstName">
              {t("membership.firstName")}
              <span aria-hidden="true"> *</span>
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
              {t("membership.lastName")}
              <span aria-hidden="true"> *</span>
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
              {t("membership.birthDate")}
              <span aria-hidden="true"> *</span>
            </label>

            <input
              id="birthDate"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="membership-field">
            <label htmlFor="membershipType">
              {t("membership.type")}
              <span aria-hidden="true"> *</span>
            </label>

            <select
              id="membershipType"
              name="membershipType"
              value={formData.membershipType}
              onChange={handleChange}
              required
            >
              <option value="">
                {t("membership.select")}
              </option>

              <option value="loisir">
                {t("membership.type.leisure")}
              </option>

              <option value="competitive">
                {t("membership.type.competitive")}
              </option>

              <option value="supporter">
                {t("membership.type.supporter")}
              </option>

              <option value="volunteer">
                {t("membership.type.volunteer")}
              </option>
            </select>
          </div>
        </div>
      </section>

      <section className="membership-form-section">
        <div className="membership-section-heading">
          <span>02</span>

          <div>
            <h2>
              {t("membership.contact.title")}
            </h2>

            <p>
              {t("membership.contact.description")}
            </p>
          </div>
        </div>

        <div className="membership-form-grid">
          <div className="membership-field">
            <label htmlFor="email">
              {t("membership.email")}
              <span aria-hidden="true"> *</span>
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
              {t("membership.phone")}
              <span aria-hidden="true"> *</span>
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
              {t("membership.street")}
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
              {t("membership.postalCode")}
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
            <label htmlFor="city">
              {t("membership.city")}
            </label>

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
            <h2>
              {t("membership.sport.title")}
            </h2>

            <p>
              {t("membership.sport.description")}
            </p>
          </div>
        </div>

        <div className="membership-form-grid">
          <div className="membership-field">
            <label htmlFor="footballLevel">
              {t("membership.footballLevel")}
            </label>

            <select
              id="footballLevel"
              name="footballLevel"
              value={formData.footballLevel}
              onChange={handleChange}
            >
              <option value="">
                {t("membership.level.select")}
              </option>

              <option value="beginner">
                {t("membership.level.beginner")}
              </option>

              <option value="leisure">
                {t("membership.level.leisure")}
              </option>

              <option value="intermediate">
                {t("membership.level.intermediate")}
              </option>

              <option value="advanced">
                {t("membership.level.advanced")}
              </option>

              <option value="competitive">
                {t("membership.level.competitive")}
              </option>
            </select>
          </div>

          <div className="membership-field">
            <label htmlFor="preferredPosition">
              {t("membership.position")}
            </label>

            <select
              id="preferredPosition"
              name="preferredPosition"
              value={formData.preferredPosition}
              onChange={handleChange}
            >
              <option value="">
                {t("membership.position.select")}
              </option>

              <option value="goalkeeper">
                {t("membership.position.goalkeeper")}
              </option>

              <option value="defender">
                {t("membership.position.defender")}
              </option>

              <option value="midfielder">
                {t("membership.position.midfielder")}
              </option>

              <option value="forward">
                {t("membership.position.forward")}
              </option>

              <option value="versatile">
                {t("membership.position.versatile")}
              </option>
            </select>
          </div>
        </div>
      </section>

      <section className="membership-form-section">
        <div className="membership-section-heading">
          <span>04</span>

          <div>
            <h2>
              {t("membership.emergency.title")}
            </h2>

            <p>
              {t("membership.emergency.description")}
            </p>
          </div>
        </div>

        <div className="membership-form-grid">
          <div className="membership-field">
            <label htmlFor="emergencyContactName">
              {t("membership.emergency.name")}
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
              {t("membership.emergency.phone")}
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
              {t("membership.message")}
            </label>

            <textarea
              id="message"
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              placeholder={t(
                "membership.message.placeholder"
              )}
            />
          </div>
        </div>
      </section>

      <section className="membership-form-section">
        <div className="membership-section-heading">
          <span>05</span>

          <div>
            <h2>
              {t("membership.consent.title")}
            </h2>

            <p>
              {t("membership.consent.description")}
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
              {t("membership.consent.privacy")}
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
              {t("membership.consent.rules")}
            </span>
          </label>
        </div>
      </section>

      <div className="membership-submit-area">
        <p>
          {t("membership.required")}
        </p>

        <button
          className="membership-submit-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? t("membership.submitting")
            : t("membership.submit")}
        </button>
      </div>
    </form>
  );
}
