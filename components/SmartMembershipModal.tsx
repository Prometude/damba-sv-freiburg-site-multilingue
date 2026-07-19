"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  HeartHandshake,
  Loader2,
  Send,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import { useLanguage } from "./LanguageProvider";

type MemberType =
  | "sportif"
  | "actif"
  | "sympathisant"
  | "benevole"
  | "partenaire";

type FormState = {
  memberType: MemberType;
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  nationality: string;
  profession: string;
  gender: string;
  team: string;
  position: string;
  level: string;
  formerClub: string;
  experience: string;
  healthInsurance: "" | "yes" | "no" | "pending";
  involvement: string;
  skills: string;
  availability: string;
  organisation: string;
  sector: string;
  website: string;
  partnership: string;
  emergencyName: string;
  emergencyPhone: string;
  message: string;
  consent: boolean;
};

const initial: FormState = {
  memberType: "sportif",
  firstName: "",
  lastName: "",
  birthDate: "",
  email: "",
  phone: "",
  address: "",
  postalCode: "",
  city: "",
  nationality: "",
  profession: "",
  gender: "",
  team: "competitive",
  position: "",
  level: "",
  formerClub: "",
  experience: "",
  healthInsurance: "",
  involvement: "",
  skills: "",
  availability: "",
  organisation: "",
  sector: "",
  website: "",
  partnership: "",
  emergencyName: "",
  emergencyPhone: "",
  message: "",
  consent: false,
};

const icons = {
  sportif: Trophy,
  actif: Users,
  sympathisant: HeartHandshake,
  benevole: User,
  partenaire: Building2,
};

export default function SmartMembershipModal() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initial);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");

  const total = 5;
  const Icon = icons[form.memberType];

  const labels = useMemo(
    () => ({
      sportif: t("smart.type.sportif"),
      actif: t("smart.type.actif"),
      sympathisant: t("smart.type.sympathisant"),
      benevole: t("smart.type.benevole"),
      partenaire: t("smart.type.partenaire"),
    }),
    [t],
  );

  useEffect(() => {
    const show = () => {
      setOpen(true);
      setStatus("idle");
      setError("");
    };

    window.addEventListener("open-membership-modal", show);
    return () => window.removeEventListener("open-membership-modal", show);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const update = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const close = () => {
    setOpen(false);
    setStep(1);
    setStatus("idle");
    setError("");
  };

  const resetAndClose = () => {
    setForm(initial);
    close();
  };

  const insuranceLabel = () => {
    switch (form.healthInsurance) {
      case "yes":
        return t("smart.healthInsuranceYes");
      case "no":
        return t("smart.healthInsuranceNo");
      case "pending":
        return t("smart.healthInsurancePending");
      default:
        return "—";
    }
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step < total) {
      setStep((current) => current + 1);
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const payload = {
        ...form,
        membershipType: form.memberType,
        experience: [
          form.team,
          form.position,
          form.level,
          form.formerClub,
          form.experience,
          form.involvement,
          form.skills,
          form.availability,
          form.organisation,
          form.sector,
          form.website,
          form.partnership,
        ]
          .filter(Boolean)
          .join(" | "),
        emergencyName:
          form.emergencyName || `${form.firstName} ${form.lastName}`.trim(),
        emergencyPhone: form.emergencyPhone || form.phone,
      };

      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || t("form.error"));
      }

      setStatus("success");
    } catch (caughtError) {
      setStatus("error");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : t("form.error"),
      );
    }
  }

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={t("smart.title")}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="smart-modal">
        <button
          type="button"
          className="modal-close"
          onClick={close}
          aria-label={t("smart.close")}
        >
          <X />
        </button>

        {status === "success" ? (
          <div className="modal-success">
            <CheckCircle2 size={64} />
            <h2>{t("success.title")}</h2>
            <p>{t("success.text")}</p>
            <button type="button" className="btn" onClick={resetAndClose}>
              {t("smart.close")}
            </button>
          </div>
        ) : (
          <>
            <div className="smart-modal-head">
              <div>
                <span className="section-kicker">{t("smart.kicker")}</span>
                <h2>{t("smart.title")}</h2>
                <p>{t("smart.intro")}</p>
              </div>

              <div className="smart-profile">
                <span>
                  <Icon size={28} />
                </span>
                <div>
                  <strong>{labels[form.memberType]}</strong>
                  <small>{t(`smart.desc.${form.memberType}`)}</small>
                </div>
              </div>
            </div>

            <div className="smart-progress">
              <div className="smart-progress-meta">
                <span>
                  {t("smart.step")} {step}/{total}
                </span>
                <strong>{step * 20}%</strong>
              </div>

              <div className="progress-track">
                <i style={{ width: `${step * 20}%` }} />
              </div>

              <div className="step-pills">
                {[1, 2, 3, 4, 5].map((number) => (
                  <span key={number} className={step >= number ? "active" : ""}>
                    {number}. {t(`smart.step.${number}`)}
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={submit} className="smart-form">
              {step === 1 && (
                <div className="smart-step">
                  <h3>{t("smart.choose")}</h3>
                  <div className="member-type-grid">
                    {(Object.keys(labels) as MemberType[]).map((type) => {
                      const TypeIcon = icons[type];

                      return (
                        <button
                          type="button"
                          key={type}
                          className={form.memberType === type ? "selected" : ""}
                          onClick={() => update("memberType", type)}
                        >
                          <TypeIcon />
                          <strong>{labels[type]}</strong>
                          <small>{t(`smart.desc.${type}`)}</small>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="smart-step">
                  <h3>
                    {form.memberType === "partenaire"
                      ? t("smart.structure")
                      : t("smart.identity")}
                  </h3>

                  <div className="form-grid">
                    {form.memberType === "partenaire" ? (
                      <>
                        <label>
                          {t("smart.organisation")} *
                          <input
                            required
                            value={form.organisation}
                            onChange={(event) =>
                              update("organisation", event.target.value)
                            }
                          />
                        </label>

                        <label>
                          {t("smart.sector")} *
                          <input
                            required
                            value={form.sector}
                            onChange={(event) =>
                              update("sector", event.target.value)
                            }
                          />
                        </label>

                        <label>
                          {t("smart.website")}
                          <input
                            type="url"
                            value={form.website}
                            onChange={(event) =>
                              update("website", event.target.value)
                            }
                          />
                        </label>
                      </>
                    ) : (
                      <>
                        <label>
                          {t("form.firstName")} *
                          <input
                            required
                            value={form.firstName}
                            onChange={(event) =>
                              update("firstName", event.target.value)
                            }
                          />
                        </label>

                        <label>
                          {t("form.lastName")} *
                          <input
                            required
                            value={form.lastName}
                            onChange={(event) =>
                              update("lastName", event.target.value)
                            }
                          />
                        </label>

                        <label>
                          {t("form.birthDate")} *
                          <input
                            type="date"
                            required
                            value={form.birthDate}
                            onChange={(event) =>
                              update("birthDate", event.target.value)
                            }
                          />
                        </label>

                        <label>
                          {t("smart.gender")}
                          <select
                            value={form.gender}
                            onChange={(event) =>
                              update("gender", event.target.value)
                            }
                          >
                            <option value="">—</option>
                            <option value="man">{t("smart.man")}</option>
                            <option value="woman">{t("smart.woman")}</option>
                            <option value="other">{t("smart.other")}</option>
                          </select>
                        </label>

                        <label>
                          {t("smart.nationality")}
                          <input
                            value={form.nationality}
                            onChange={(event) =>
                              update("nationality", event.target.value)
                            }
                          />
                        </label>

                        <label>
                          {t("smart.profession")}
                          <input
                            value={form.profession}
                            onChange={(event) =>
                              update("profession", event.target.value)
                            }
                          />
                        </label>
                      </>
                    )}

                    <label>
                      {t("form.phone")} *
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(event) =>
                          update("phone", event.target.value)
                        }
                      />
                    </label>

                    <label>
                      {t("form.email")} *
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(event) =>
                          update("email", event.target.value)
                        }
                      />
                    </label>

                    <label className="full">
                      {t("form.address")} *
                      <input
                        required
                        value={form.address}
                        onChange={(event) =>
                          update("address", event.target.value)
                        }
                      />
                    </label>

                    <label>
                      {t("form.postalCode")} *
                      <input
                        required
                        value={form.postalCode}
                        onChange={(event) =>
                          update("postalCode", event.target.value)
                        }
                      />
                    </label>

                    <label>
                      {t("form.city")} *
                      <input
                        required
                        value={form.city}
                        onChange={(event) =>
                          update("city", event.target.value)
                        }
                      />
                    </label>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="smart-step">
                  <h3>{t(`smart.profile.${form.memberType}`)}</h3>

                  <div className="form-grid">
                    {form.memberType === "sportif" && (
                      <>
                        <label>
                          {t("smart.team")}
                          <select
                            value={form.team}
                            onChange={(event) =>
                              update("team", event.target.value)
                            }
                          >
                            <option value="competitive">
                              {t("form.competitive")}
                            </option>
                            <option value="loisir">{t("form.leisure")}</option>
                          </select>
                        </label>

                        <label>
                          {t("smart.position")}
                          <input
                            value={form.position}
                            onChange={(event) =>
                              update("position", event.target.value)
                            }
                          />
                        </label>

                        <label>
                          {t("smart.level")}
                          <input
                            value={form.level}
                            onChange={(event) =>
                              update("level", event.target.value)
                            }
                          />
                        </label>

                        <label>
                          {t("smart.formerClub")}
                          <input
                            value={form.formerClub}
                            onChange={(event) =>
                              update("formerClub", event.target.value)
                            }
                          />
                        </label>

                        <fieldset className="full insurance-fieldset">
                          <legend>{t("smart.healthInsurance")} *</legend>
                          <p className="field-help">
                            {t("smart.healthInsuranceHelp")}
                          </p>

                          <div className="radio-options">
                            <label className="radio-option">
                              <input
                                type="radio"
                                name="healthInsurance"
                                value="yes"
                                required
                                checked={form.healthInsurance === "yes"}
                                onChange={() =>
                                  update("healthInsurance", "yes")
                                }
                              />
                              <span>{t("smart.healthInsuranceYes")}</span>
                            </label>

                            <label className="radio-option">
                              <input
                                type="radio"
                                name="healthInsurance"
                                value="no"
                                required
                                checked={form.healthInsurance === "no"}
                                onChange={() =>
                                  update("healthInsurance", "no")
                                }
                              />
                              <span>{t("smart.healthInsuranceNo")}</span>
                            </label>

                            <label className="radio-option">
                              <input
                                type="radio"
                                name="healthInsurance"
                                value="pending"
                                required
                                checked={form.healthInsurance === "pending"}
                                onChange={() =>
                                  update("healthInsurance", "pending")
                                }
                              />
                              <span>{t("smart.healthInsurancePending")}</span>
                            </label>
                          </div>
                        </fieldset>

                        <label className="full">
                          {t("form.experience")}
                          <textarea
                            rows={4}
                            value={form.experience}
                            onChange={(event) =>
                              update("experience", event.target.value)
                            }
                          />
                        </label>
                      </>
                    )}

                    {form.memberType === "actif" && (
                      <>
                        <label className="full">
                          {t("smart.involvement")}
                          <textarea
                            rows={4}
                            value={form.involvement}
                            onChange={(event) =>
                              update("involvement", event.target.value)
                            }
                          />
                        </label>

                        <label className="full">
                          {t("smart.skills")}
                          <textarea
                            rows={4}
                            value={form.skills}
                            onChange={(event) =>
                              update("skills", event.target.value)
                            }
                          />
                        </label>
                      </>
                    )}

                    {form.memberType === "sympathisant" && (
                      <label className="full">
                        {t("smart.involvement")}
                        <textarea
                          rows={5}
                          value={form.involvement}
                          onChange={(event) =>
                            update("involvement", event.target.value)
                          }
                        />
                      </label>
                    )}

                    {form.memberType === "benevole" && (
                      <>
                        <label className="full">
                          {t("smart.skills")}
                          <textarea
                            rows={4}
                            value={form.skills}
                            onChange={(event) =>
                              update("skills", event.target.value)
                            }
                          />
                        </label>

                        <label className="full">
                          {t("smart.involvement")}
                          <textarea
                            rows={4}
                            value={form.involvement}
                            onChange={(event) =>
                              update("involvement", event.target.value)
                            }
                          />
                        </label>
                      </>
                    )}

                    {form.memberType === "partenaire" && (
                      <label className="full">
                        {t("smart.partnership")}
                        <textarea
                          rows={6}
                          value={form.partnership}
                          onChange={(event) =>
                            update("partnership", event.target.value)
                          }
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="smart-step">
                  <h3>{t("smart.availability")}</h3>

                  <div className="form-grid">
                    <label className="full">
                      {t("smart.availabilityPrompt")}
                      <textarea
                        rows={5}
                        value={form.availability}
                        onChange={(event) =>
                          update("availability", event.target.value)
                        }
                      />
                    </label>

                    {form.memberType !== "partenaire" && (
                      <>
                        <label>
                          {t("form.emergency")} — {t("form.fullName")}
                          <input
                            value={form.emergencyName}
                            onChange={(event) =>
                              update("emergencyName", event.target.value)
                            }
                          />
                        </label>

                        <label>
                          {t("form.emergency")} — {t("form.phone")}
                          <input
                            type="tel"
                            value={form.emergencyPhone}
                            onChange={(event) =>
                              update("emergencyPhone", event.target.value)
                            }
                          />
                        </label>
                      </>
                    )}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="smart-step">
                  <h3>{t("smart.validation")}</h3>

                  <div className="review-box">
                    <Icon />
                    <div>
                      <strong>{labels[form.memberType]}</strong>
                      <p>
                        {form.memberType === "partenaire"
                          ? form.organisation
                          : `${form.firstName} ${form.lastName}`}
                      </p>
                      <p>
                        {form.email} · {form.phone}
                      </p>
                      <p>
                        {form.address}, {form.postalCode} {form.city}
                      </p>

                      {form.memberType === "sportif" && (
                        <p>
                          <strong>{t("smart.healthInsurance")}:</strong>{" "}
                          {insuranceLabel()}
                        </p>
                      )}
                    </div>
                  </div>

                  <label className="full">
                    {t("form.additional")}
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={(event) =>
                        update("message", event.target.value)
                      }
                    />
                  </label>

                  <label className="checkbox-row">
                    <input
                      required
                      type="checkbox"
                      checked={form.consent}
                      onChange={(event) =>
                        update("consent", event.target.checked)
                      }
                    />
                    <span>{t("form.consent")} *</span>
                  </label>

                  {status === "error" && (
                    <p className="form-error">{error}</p>
                  )}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={step === 1 || status === "loading"}
                  onClick={() => setStep((current) => Math.max(1, current - 1))}
                >
                  <ArrowLeft size={18} />
                  {t("smart.back")}
                </button>

                <button className="btn" disabled={status === "loading"}>
                  {status === "loading" ? (
                    <>
                      <Loader2 className="spin" size={18} />
                      {t("form.sending")}
                    </>
                  ) : step === total ? (
                    <>
                      <Send size={18} />
                      {t("form.submit")}
                    </>
                  ) : (
                    <>
                      {t("smart.next")}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}