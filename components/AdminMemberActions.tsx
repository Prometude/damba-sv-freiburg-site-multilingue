"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

type Props = {
  memberId: string;
  memberNumber: string | null;
  role: string;
  contributionStatus: string;
  applicationStatus: string;
  membershipStatus: string;
  accessStatus: string;
};

export default function AdminMemberActions({
  memberId,
  memberNumber,
  role,
  contributionStatus,
  applicationStatus,
  membershipStatus,
  accessStatus,
}: Props) {
  const router = useRouter();

  const [selectedRole, setSelectedRole] =
    useState(role);

  const [
    selectedContributionStatus,
    setSelectedContributionStatus,
  ] = useState(contributionStatus);

  const [
    selectedMemberNumber,
    setSelectedMemberNumber,
  ] = useState(memberNumber || "");

  const [
    rejectionReason,
    setRejectionReason,
  ] = useState("");

  const [
    suspensionReason,
    setSuspensionReason,
  ] = useState("");

  const [loading, setLoading] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function performAction(
    action: string,
    extra: Record<string, unknown> = {}
  ) {
    setMessage("");
    setError("");
    setLoading(action);

    try {
      const response = await fetch(
        `/api/admin/members/${memberId}`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action,
            ...extra,
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
            "L’opération a échoué."
        );
      }

      setMessage(
        result.message ||
          "Opération terminée."
      );

      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading("");
    }
  }

  async function sendInvitation() {
    setMessage("");
    setError("");
    setLoading("invite");

    try {
      const response = await fetch(
        `/api/admin/members/${memberId}/invite`,
        {
          method: "POST",
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
            "L’invitation n’a pas pu être envoyée."
        );
      }

      setMessage(
        result.message ||
          "Invitation envoyée."
      );

      router.refresh();
    } catch (inviteError) {
      setError(
        inviteError instanceof Error
          ? inviteError.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading("");
    }
  }

  return (
    <section className="admin-member-actions">
      <div className="admin-member-status-grid">
        <div>
          <span>Demande</span>
          <strong>{applicationStatus}</strong>
        </div>

        <div>
          <span>Adhésion</span>
          <strong>{membershipStatus}</strong>
        </div>

        <div>
          <span>Accès</span>
          <strong>{accessStatus}</strong>
        </div>
      </div>

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

      <div className="admin-member-panel">
        <h2>Paramètres du membre</h2>

        <label>
          Numéro de membre
          <input
            type="text"
            value={selectedMemberNumber}
            placeholder="DSV-2026-0001"
            onChange={(event) =>
              setSelectedMemberNumber(
                event.target.value
              )
            }
          />
        </label>

        <label>
          Rôle
          <select
            value={selectedRole}
            onChange={(event) =>
              setSelectedRole(
                event.target.value
              )
            }
          >
            <option value="member">
              Membre
            </option>
            <option value="player">
              Joueur
            </option>
            <option value="coach">
              Entraîneur
            </option>
            <option value="committee">
              Comité
            </option>
            <option value="treasurer">
              Trésorier
            </option>
            <option value="admin">
              Administrateur
            </option>
          </select>
        </label>

        <label>
          Situation de cotisation
          <select
            value={
              selectedContributionStatus
            }
            onChange={(event) =>
              setSelectedContributionStatus(
                event.target.value
              )
            }
          >
            <option value="paid">
              À jour
            </option>
            <option value="unpaid">
              Non réglée
            </option>
            <option value="overdue">
              En retard
            </option>
            <option value="exempt">
              Exonérée
            </option>
            <option value="grace_period">
              Période de tolérance
            </option>
          </select>
        </label>

        <button
          type="button"
          disabled={
            loading === "update_settings"
          }
          onClick={() =>
            performAction(
              "update_settings",
              {
                role: selectedRole,
                contributionStatus:
                  selectedContributionStatus,
                memberNumber:
                  selectedMemberNumber,
              }
            )
          }
        >
          Enregistrer les paramètres
        </button>
      </div>

      <div className="admin-member-panel">
        <h2>Décision d’adhésion</h2>

        <button
          type="button"
          className="admin-member-approve"
          disabled={Boolean(loading)}
          onClick={() =>
            performAction("approve")
          }
        >
          Accepter l’adhésion
        </button>

        <textarea
          value={rejectionReason}
          placeholder="Motif obligatoire en cas de refus"
          onChange={(event) =>
            setRejectionReason(
              event.target.value
            )
          }
        />

        <button
          type="button"
          className="admin-member-danger"
          disabled={Boolean(loading)}
          onClick={() =>
            performAction("reject", {
              rejectionReason,
            })
          }
        >
          Refuser l’adhésion
        </button>
      </div>

      <div className="admin-member-panel">
        <h2>Accès à l’espace membre</h2>

        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() =>
            performAction(
              "activate_access"
            )
          }
        >
          Autoriser l’accès
        </button>

        <button
          type="button"
          disabled={Boolean(loading)}
          onClick={() =>
            performAction("limit_access")
          }
        >
          Limiter l’accès
        </button>

        <textarea
          value={suspensionReason}
          placeholder="Motif obligatoire en cas de suspension"
          onChange={(event) =>
            setSuspensionReason(
              event.target.value
            )
          }
        />

        <button
          type="button"
          className="admin-member-danger"
          disabled={Boolean(loading)}
          onClick={() =>
            performAction(
              "suspend_access",
              {
                suspensionReason,
              }
            )
          }
        >
          Suspendre l’accès
        </button>

        <button
          type="button"
          className="admin-member-invite"
          disabled={
            Boolean(loading) ||
            applicationStatus !==
              "approved"
          }
          onClick={sendInvitation}
        >
          Envoyer l’invitation de création du mot de passe
        </button>
      </div>
    </section>
  );
}
