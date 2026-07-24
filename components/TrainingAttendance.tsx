"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

type AttendanceStatus =
  | "present"
  | "absent"
  | "";

type AttendanceAvailability = {
  isOpen: boolean;
  trainingDate: string | null;
  trainingTime: string;
};

function formatTrainingDate(
  value: string
) {
  const [year, month, day] =
    value.split("-").map(Number);

  return new Intl.DateTimeFormat(
    "fr-FR",
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
            "Impossible d’enregistrer la réponse."
        );
      }

      setMessage(
        result.message ||
          "Votre réponse a été enregistrée."
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Une erreur est survenue."
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
    <section className="attendance-section">
      <div className="container">
        <div className="attendance-card">
          <div className="attendance-heading">
            <span className="section-kicker">
              Prochain entraînement
            </span>

            <h2>
              Demandez votre participation
            </h2>

            <p>
              {formatTrainingDate(
                availability.trainingDate
              )}{" "}
              · {availability.trainingTime}
            </p>

            <small>
              Toute demande de participation doit être examinée
              par un responsable. Vous recevrez la décision par e-mail.
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
                Prénom
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
                Nom
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
                Adresse e-mail
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
                Serez-vous présent(e) ?
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
                  onChange={() =>
                    setStatus("present")
                  }
                  required
                />

                <span>✓</span>
                Je souhaite participer
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
                  onChange={() =>
                    setStatus("absent")
                  }
                  required
                />

                <span>×</span>
                Je serai absent(e)
              </label>
            </fieldset>

            <button
              type="submit"
              className="attendance-submit"
              disabled={submitting}
            >
              {submitting
                ? "Enregistrement…"
                : "Envoyer ma demande"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
