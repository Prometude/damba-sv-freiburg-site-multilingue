"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { useLanguage } from "./LanguageProvider";

type AttendanceStatus =
  | "present"
  | "absent"
  | "";

const attendanceTranslations = {
  fr: {
    locale: "fr-FR",
    kicker: "Prochain entraînement",
    title: "Demandez votre participation",
    description:
      "Toute demande de participation doit être examinée par un responsable. Vous recevrez la décision par e-mail.",
    firstName: "Prénom",
    lastName: "Nom",
    email: "Adresse e-mail",
    attendanceQuestion: "Serez-vous présent(e) ?",
    present: "Je souhaite participer",
    absent: "Je serai absent(e)",
    guestsQuestion:
      "Viendrez-vous avec un ou plusieurs visiteurs ?",
    no: "Non",
    yes: "Oui",
    guestCount: "Nombre de visiteurs",
    oneGuest: "1 visiteur",
    twoGuests: "2 visiteurs",
    threeGuests: "3 visiteurs",
    guestNotice:
      "La présence des visiteurs reste soumise à la validation du responsable.",
    submit: "Envoyer ma demande",
    submitting: "Enregistrement…",
    submitError:
      "Impossible d’enregistrer votre réponse.",
    genericError: "Une erreur est survenue.",
    defaultSuccess:
      "Votre réponse a été enregistrée.",
  },

  en: {
    locale: "en-GB",
    kicker: "Next training session",
    title: "Request your participation",
    description:
      "Every participation request must be reviewed by a club official. You will receive the decision by email.",
    firstName: "First name",
    lastName: "Last name",
    email: "Email address",
    attendanceQuestion: "Will you attend?",
    present: "I would like to participate",
    absent: "I will be absent",
    guestsQuestion:
      "Will you bring one or more guests?",
    no: "No",
    yes: "Yes",
    guestCount: "Number of guests",
    oneGuest: "1 guest",
    twoGuests: "2 guests",
    threeGuests: "3 guests",
    guestNotice:
      "Guest attendance remains subject to approval by the club official.",
    submit: "Send my request",
    submitting: "Submitting…",
    submitError:
      "Unable to submit your response.",
    genericError: "An error occurred.",
    defaultSuccess:
      "Your response has been recorded.",
  },

  de: {
    locale: "de-DE",
    kicker: "Nächstes Training",
    title: "Teilnahme anfragen",
    description:
      "Jede Teilnahmeanfrage muss von einem Verantwortlichen geprüft werden. Die Entscheidung erhalten Sie per E-Mail.",
    firstName: "Vorname",
    lastName: "Nachname",
    email: "E-Mail-Adresse",
    attendanceQuestion: "Werden Sie teilnehmen?",
    present: "Ich möchte teilnehmen",
    absent: "Ich werde nicht teilnehmen",
    guestsQuestion:
      "Bringen Sie einen oder mehrere Gäste mit?",
    no: "Nein",
    yes: "Ja",
    guestCount: "Anzahl der Gäste",
    oneGuest: "1 Gast",
    twoGuests: "2 Gäste",
    threeGuests: "3 Gäste",
    guestNotice:
      "Die Teilnahme von Gästen muss durch einen Verantwortlichen bestätigt werden.",
    submit: "Anfrage senden",
    submitting: "Wird gesendet…",
    submitError:
      "Ihre Antwort konnte nicht übermittelt werden.",
    genericError: "Ein Fehler ist aufgetreten.",
    defaultSuccess:
      "Ihre Antwort wurde gespeichert.",
  },
} as const;

type AttendanceAvailability = {
  isOpen: boolean;
  trainingDate: string | null;
  trainingTime: string;
};

function formatTrainingDate(
  value: string,
  locale: string
) {
  const [year, month, day] =
    value.split("-").map(Number);

  return new Intl.DateTimeFormat(
    locale,
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Europe/Berlin",
    }
  ).format(
    new Date(
      Date.UTC(year, month - 1, day, 12)
    )
  );
}

export default function TrainingAttendance() {
  const { language } = useLanguage();

  const textContent =
    attendanceTranslations[
      language as keyof typeof attendanceTranslations
    ] ?? attendanceTranslations.fr;

  const [availability, setAvailability] =
    useState<AttendanceAvailability | null>(
      null
    );

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [status, setStatus] =
    useState<AttendanceStatus>("");

  const [hasGuests, setHasGuests] =
    useState<boolean | null>(null);

  const [guestCount, setGuestCount] =
    useState(1);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      try {
        const response = await fetch(
          "/api/attendance",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const result =
          (await response.json()) as
            AttendanceAvailability;

        if (!cancelled) {
          setAvailability(result);
        }
      } catch {
        // Le formulaire reste invisible
        // si le statut ne peut pas être chargé.
      }
    }

    loadAvailability();

    const interval = window.setInterval(
      loadAvailability,
      60_000
    );

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/attendance",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            status,
            guestCount:
              status === "present" && hasGuests
                ? guestCount
                : 0,
            language,
            website: "",
          }),
        }
      );

      const result =
        (await response.json()) as {
          message?: string;
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          result.error ||
            textContent.submitError
        );
      }

      setMessage(
        result.message ||
          textContent.defaultSuccess
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : textContent.genericError
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (
    !availability ||
    !availability.isOpen ||
    !availability.trainingDate
  ) {
    return null;
  }

  return (
    <section
      id="entrainement"
      className="attendance-section"
    >
      <div className="container">
        <div className="attendance-card">
          <div className="attendance-heading">
            <span className="section-kicker">
              {textContent.kicker}
            </span>

            <h2>
              {textContent.title}
            </h2>

            <p>
              {formatTrainingDate(
                availability.trainingDate,
                textContent.locale
              )}{" "}
              · {availability.trainingTime}
            </p>

            <small>
              {textContent.description}
            </small>
          </div>

          <form
            className="attendance-form"
            onSubmit={handleSubmit}
          >
            {message && (
              <div
                className="attendance-alert attendance-success"
                role="status"
              >
                {message}
              </div>
            )}

            {error && (
              <div
                className="attendance-alert attendance-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="attendance-fields">
              <label>
                {textContent.firstName}
                <input
                  type="text"
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(
                      event.target.value
                    )
                  }
                  autoComplete="given-name"
                  minLength={2}
                  maxLength={100}
                  required
                />
              </label>

              <label>
                {textContent.lastName}
                <input
                  type="text"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(
                      event.target.value
                    )
                  }
                  autoComplete="family-name"
                  minLength={2}
                  maxLength={100}
                  required
                />
              </label>

              <label>
                {textContent.email}
                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                  maxLength={254}
                  required
                />
              </label>
            </div>

            <fieldset className="attendance-options">
              <legend>
                {textContent.attendanceQuestion}
              </legend>

              <label
                className={
                  status === "present"
                    ? "selected present"
                    : ""
                }
              >
                <input
                  type="radio"
                  name="attendanceStatus"
                  value="present"
                  checked={
                    status === "present"
                  }
                  onChange={() => {
                    setStatus("present");
                  }}
                  required
                />

                <span>✓</span>
                {textContent.present}
              </label>

              <label
                className={
                  status === "absent"
                    ? "selected absent"
                    : ""
                }
              >
                <input
                  type="radio"
                  name="attendanceStatus"
                  value="absent"
                  checked={
                    status === "absent"
                  }
                  onChange={() => {
                    setStatus("absent");
                    setHasGuests(null);
                    setGuestCount(1);
                  }}
                  required
                />

                <span>×</span>
                {textContent.absent}
              </label>
            </fieldset>

            {status === "present" && (
              <fieldset className="attendance-guests">
                <legend>
                  {textContent.guestsQuestion}
                </legend>

                <div className="attendance-guest-options">
                  <label
                    className={
                      hasGuests === false
                        ? "selected"
                        : ""
                    }
                  >
                    <input
                      type="radio"
                      name="hasGuests"
                      checked={hasGuests === false}
                      onChange={() => {
                        setHasGuests(false);
                        setGuestCount(1);
                      }}
                      required
                    />
                    {textContent.no}
                  </label>

                  <label
                    className={
                      hasGuests === true
                        ? "selected"
                        : ""
                    }
                  >
                    <input
                      type="radio"
                      name="hasGuests"
                      checked={hasGuests === true}
                      onChange={() =>
                        setHasGuests(true)
                      }
                      required
                    />
                    {textContent.yes}
                  </label>
                </div>

                {hasGuests === true && (
                  <label className="attendance-guest-count">
                    {textContent.guestCount}

                    <select
                      value={guestCount}
                      onChange={(event) =>
                        setGuestCount(
                          Number(event.target.value)
                        )
                      }
                      required
                    >
                      <option value={1}>
                        {textContent.oneGuest}
                      </option>

                      <option value={2}>
                        {textContent.twoGuests}
                      </option>

                      <option value={3}>
                        {textContent.threeGuests}
                      </option>
                    </select>
                  </label>
                )}

                <small>
                  {textContent.guestNotice}
                </small>
              </fieldset>
            )}

            <button
              type="submit"
              className="attendance-submit"
              disabled={submitting}
            >
              {submitting
                ? textContent.submitting
                : textContent.submit}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
