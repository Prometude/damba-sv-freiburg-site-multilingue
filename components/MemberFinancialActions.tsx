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
  entryId: string;
  entryType: string;
  currentStatus: string;
};

const contestableTypes = [
  "sanction",
  "damage_reimbursement",
  "other",
];

const contestableStatuses = [
  "pending",
  "partially_paid",
  "overdue",
];

export default function MemberFinancialActions({
  entryId,
  entryType,
  currentStatus,
}: Props) {
  const router = useRouter();

  const { language } =
    useLanguage();

  const text = (
    key: Parameters<
      typeof getMemberText
    >[1]
  ) => getMemberText(language, key);

  const [isOpen, setIsOpen] =
    useState(false);

  const [reason, setReason] =
    useState("");

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const canContest =
    contestableTypes.includes(
      entryType
    ) &&
    contestableStatuses.includes(
      currentStatus
    );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/member/financial-entries/${entryId}/contest`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            reason,
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
            text(
              "finance.contestFailed"
            )
        );
      }

      setMessage(
        result.message ||
          text(
            "finance.contestSuccess"
          )
      );

      setReason("");
      setIsOpen(false);

      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : text("auth.genericError")
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (
    currentStatus === "contested"
  ) {
    return (
      <span className="member-finance-contested-label">
        {text(
          "finance.contestPending"
        )}
      </span>
    );
  }

  if (!canContest) {
    return null;
  }

  return (
    <div className="member-finance-action">
      {!isOpen && (
        <button
          type="button"
          className="member-finance-contest-button"
          onClick={() =>
            setIsOpen(true)
          }
        >
          {text("finance.contest")}
        </button>
      )}

      {isOpen && (
        <form
          className="member-finance-contest-form"
          onSubmit={handleSubmit}
        >
          <label>
            {text(
              "finance.contestReason"
            )}

            <textarea
              value={reason}
              minLength={10}
              maxLength={2000}
              required
              placeholder={text(
                "finance.contestPlaceholder"
              )}
              onChange={(event) =>
                setReason(
                  event.target.value
                )
              }
            />
          </label>

          <div className="member-finance-contest-actions">
            <button
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? text(
                    "finance.sending"
                  )
                : text(
                    "finance.sendContest"
                  )}
            </button>

            <button
              type="button"
              className="member-finance-secondary-button"
              disabled={submitting}
              onClick={() => {
                setIsOpen(false);
                setError("");
              }}
            >
              {text("common.cancel")}
            </button>
          </div>
        </form>
      )}

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
    </div>
  );
}
