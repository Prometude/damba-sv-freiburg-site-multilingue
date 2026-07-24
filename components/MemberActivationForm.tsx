"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useLanguage,
} from "./LanguageProvider";

import {
  getMemberText,
} from "../lib/member-i18n";

type Props = {
  token: string;
};

export default function MemberActivationForm({
  token,
}: Props) {
  const router = useRouter();

  const { language } =
    useLanguage();

  const text = (
    key: Parameters<
      typeof getMemberText
    >[1]
  ) => getMemberText(language, key);

  const [password, setPassword] =
    useState("");

  const [
    passwordConfirmation,
    setPasswordConfirmation,
  ] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/member/activate",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            token,
            password,
            passwordConfirmation,
            language,
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
            text("activation.failed")
        );
      }

      setMessage(
        result.message ||
          text("activation.success")
      );

      window.setTimeout(() => {
        router.push(
          "/espace-membre/connexion?activated=1"
        );
      }, 1200);
    } catch (activationError) {
      setError(
        activationError instanceof Error
          ? activationError.message
          : text("auth.genericError")
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="member-auth-alert member-auth-error">
        {text(
          "activation.incompleteLink"
        )}
      </div>
    );
  }

  return (
    <form
      className="member-auth-form"
      onSubmit={handleSubmit}
    >
      {message && (
        <div className="member-auth-alert member-auth-success">
          {message}
        </div>
      )}

      {error && (
        <div className="member-auth-alert member-auth-error">
          {error}
        </div>
      )}

      <label>
        {text(
          "activation.newPassword"
        )}

        <input
          type={
            showPassword
              ? "text"
              : "password"
          }
          value={password}
          onChange={(event) =>
            setPassword(
              event.target.value
            )
          }
          autoComplete="new-password"
          minLength={10}
          required
        />
      </label>

      <label>
        {text(
          "activation.confirmPassword"
        )}

        <input
          type={
            showPassword
              ? "text"
              : "password"
          }
          value={passwordConfirmation}
          onChange={(event) =>
            setPasswordConfirmation(
              event.target.value
            )
          }
          autoComplete="new-password"
          minLength={10}
          required
        />
      </label>

      <label className="member-auth-checkbox">
        <input
          type="checkbox"
          checked={showPassword}
          onChange={(event) =>
            setShowPassword(
              event.target.checked
            )
          }
        />

        {text("auth.showPassword")}
      </label>

      <small>
        {text(
          "activation.passwordHelp"
        )}
      </small>

      <button
        type="submit"
        disabled={submitting}
      >
        {submitting
          ? text(
              "activation.activating"
            )
          : text(
              "activation.activate"
            )}
      </button>
    </form>
  );
}
