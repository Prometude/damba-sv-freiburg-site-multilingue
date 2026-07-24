"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AttendanceItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "absent";
  rejectionReason: string | null;
  updatedAt: string;
};

type Props = {
  items: AttendanceItem[];
};

const labels = {
  pending: "En attente",
  approved: "Validés",
  rejected: "Refusés",
  absent: "Absents",
};

export default function AdminAttendanceReview({
  items,
}: Props) {
  const router = useRouter();

  const [reasonById, setReasonById] =
    useState<Record<string, string>>({});

  const [loadingId, setLoadingId] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function review(
    id: string,
    decision: "approved" | "rejected"
  ) {
    setMessage("");
    setError("");

    const reason =
      reasonById[id]?.trim() ?? "";

    if (
      decision === "rejected" &&
      reason.length < 5
    ) {
      setError(
        "Indiquez un motif de refus d’au moins 5 caractères."
      );
      return;
    }

    setLoadingId(id);

    try {
      const response = await fetch(
        "/api/admin/attendance/review",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id,
            decision,
            reason,
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
            "Impossible de traiter la demande."
        );
      }

      setMessage(
        result.message ||
          "Décision enregistrée."
      );

      router.refresh();
    } catch (reviewError) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoadingId("");
    }
  }

  return (
    <>
      {message && (
        <div className="attendance-alert attendance-success">
          {message}
        </div>
      )}

      {error && (
        <div className="attendance-alert attendance-error">
          {error}
        </div>
      )}

      <div className="attendance-review-groups">
        {(
          [
            "pending",
            "approved",
            "rejected",
            "absent",
          ] as const
        ).map((status) => {
          const group =
            items.filter(
              (item) =>
                item.status === status
            );

          return (
            <section key={status}>
              <h2>
                {labels[status]}
                <span>{group.length}</span>
              </h2>

              {group.map((item) => (
                <article
                  key={item.id}
                  className="attendance-review-card"
                >
                  <strong>
                    {item.firstName}{" "}
                    {item.lastName}
                  </strong>

                  <span>
                    {item.email ||
                      "Adresse e-mail absente"}
                  </span>

                  <small>
                    Mise à jour :{" "}
                    {new Intl.DateTimeFormat(
                      "fr-FR",
                      {
                        dateStyle: "short",
                        timeStyle: "short",
                        timeZone:
                          "Europe/Berlin",
                      }
                    ).format(
                      new Date(
                        item.updatedAt
                      )
                    )}
                  </small>

                  {item.rejectionReason && (
                    <p>
                      <strong>Motif :</strong>{" "}
                      {item.rejectionReason}
                    </p>
                  )}

                  {status === "pending" && (
                    <div className="attendance-review-actions">
                      <button
                        type="button"
                        className="attendance-approve"
                        disabled={
                          loadingId === item.id ||
                          !item.email
                        }
                        onClick={() =>
                          review(
                            item.id,
                            "approved"
                          )
                        }
                      >
                        Valider
                      </button>

                      <textarea
                        placeholder="Motif obligatoire en cas de refus"
                        value={
                          reasonById[
                            item.id
                          ] ?? ""
                        }
                        onChange={(event) =>
                          setReasonById(
                            (current) => ({
                              ...current,
                              [item.id]:
                                event.target.value,
                            })
                          )
                        }
                        maxLength={1000}
                      />

                      <button
                        type="button"
                        className="attendance-reject"
                        disabled={
                          loadingId === item.id ||
                          !item.email
                        }
                        onClick={() =>
                          review(
                            item.id,
                            "rejected"
                          )
                        }
                      >
                        Refuser
                      </button>
                    </div>
                  )}
                </article>
              ))}

              {group.length === 0 && (
                <p>
                  Aucune réponse dans cette catégorie.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
