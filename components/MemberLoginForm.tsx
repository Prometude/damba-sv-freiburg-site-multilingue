"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  useLanguage,
} from "./LanguageProvider";

import {
  getMemberText,
} from "../lib/member-i18n";

export default function MemberLoginForm() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const { language } =
    useLanguage();

  const text = (
    key: Parameters<
      typeof getMemberText
    >[1]
  ) => getMemberText(language, key);

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const accountActivated =
    searchParams.get("activated") === "1";

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/member/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            language,
          }),
        }
      );

      const result =
        (await response.json()) as {
          redirectTo?: string;
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          result.error ||
            text("auth.loginFailed")
        );
      }

      router.push(
        result.redirectTo ||
          "/espace-membre"
      );

      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : text("auth.genericError")
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="member-auth-form"
      onSubmit={handleSubmit}
    >
      {accountActivated && (
        <div className="member-auth-alert member-auth-success">
          {text("auth.activated")}
        </div>
      )}

      {error && (
        <div className="member-auth-alert member-auth-error">
          {error}
        </div>
      )}

      <label>
        {text("auth.email")}

        <input
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          autoComplete="email"
          required
        />
      </label>

      <label>
        {text("auth.password")}

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
          autoComplete="current-password"
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

      <button
        type="submit"
        disabled={submitting}
      >
        {submitting
          ? text("auth.loggingIn")
          : text("auth.login")}
      </button>
    </form>
  );
}
