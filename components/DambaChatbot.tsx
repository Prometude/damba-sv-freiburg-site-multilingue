"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { MessageCircle, X } from "lucide-react";

type Language = "fr" | "en" | "de";
type Step = "chat" | "contact";

type Message = {
  id: number;
  sender: "bot" | "user";
  text: string;
};

const content = {
  fr: {
    title: "Assistant Damba",
    status: "Réponse automatique",
    welcome:
      "Bonjour 👋 Je suis l’assistant automatique de Damba SV Freiburg. Comment puis-je vous aider ?",
    placeholder: "Écrivez votre question…",
    send: "Envoyer",
    open: "Ouvrir le chatbot",
    close: "Fermer le chatbot",
    back: "Retour à la conversation",
    unavailable:
      "L’administrateur n’est pas disponible actuellement. Je peux répondre aux questions courantes ou transmettre votre message.",
    fallback:
      "Je n’ai pas trouvé de réponse précise. Vous pouvez laisser un message à l’administrateur.",
    leaveMessage: "Laisser un message",
    quickQuestions: [
      "Quand ont lieu les entraînements ?",
      "Comment devenir membre ?",
      "Où se trouve le stade ?",
      "Quels sont les frais d’adhésion ?",
      "Contacter un responsable",
    ],
    answers: {
      training:
        "Les entraînements ont lieu le samedi de 17h00 à 19h00.",
      location:
        "Les activités ont lieu au Schönbergstadion, Wiesentalstraße 2, 79115 Freiburg im Breisgau.",
      membership:
        "Pour devenir membre, utilisez le formulaire d’inscription disponible sur le site. L’équipe de Damba vous contactera ensuite.",
      fees:
        "Les informations concernant les cotisations sont communiquées lors de l’inscription ou par un responsable du club.",
      contact:
        "Vous pouvez laisser un message ici. Il sera transmis à infos@dambasv-freiburg.de.",
      activities:
        "Damba SV Freiburg propose du football, des activités d’intégration, de solidarité, de formation et des actions pour la jeunesse.",
    },
    formTitle: "Laisser un message",
    formDescription:
      "Votre message sera transmis à l’administration de Damba SV Freiburg.",
    name: "Nom",
    email: "Adresse e-mail",
    message: "Message",
    sending: "Envoi en cours…",
    success: "Votre message a bien été envoyé.",
    error: "Le message n’a pas pu être envoyé.",
  },

  en: {
    title: "Damba Assistant",
    status: "Automatic reply",
    welcome:
      "Hello 👋 I am the automatic assistant of Damba SV Freiburg. How can I help you?",
    placeholder: "Write your question…",
    send: "Send",
    open: "Open chatbot",
    close: "Close chatbot",
    back: "Back to conversation",
    unavailable:
      "The administrator is currently unavailable. I can answer common questions or forward your message.",
    fallback:
      "I could not find a precise answer. You can leave a message for the administrator.",
    leaveMessage: "Leave a message",
    quickQuestions: [
      "When are the training sessions?",
      "How can I become a member?",
      "Where is the stadium?",
      "What are the membership fees?",
      "Contact a representative",
    ],
    answers: {
      training:
        "Training sessions take place on Saturdays from 5:00 PM to 7:00 PM.",
      location:
        "Activities take place at Schönbergstadion, Wiesentalstraße 2, 79115 Freiburg im Breisgau.",
      membership:
        "To become a member, use the registration form available on the website. The Damba team will then contact you.",
      fees:
        "Membership fee information is provided during registration or by a club representative.",
      contact:
        "You can leave a message here. It will be forwarded to infos@dambasv-freiburg.de.",
      activities:
        "Damba SV Freiburg offers football, integration, solidarity, training and youth activities.",
    },
    formTitle: "Leave a message",
    formDescription:
      "Your message will be forwarded to the Damba SV Freiburg administration.",
    name: "Name",
    email: "Email address",
    message: "Message",
    sending: "Sending…",
    success: "Your message has been sent.",
    error: "The message could not be sent.",
  },

  de: {
    title: "Damba-Assistent",
    status: "Automatische Antwort",
    welcome:
      "Hallo 👋 Ich bin der automatische Assistent von Damba SV Freiburg. Wie kann ich helfen?",
    placeholder: "Schreiben Sie Ihre Frage…",
    send: "Senden",
    open: "Chatbot öffnen",
    close: "Chatbot schließen",
    back: "Zurück zum Gespräch",
    unavailable:
      "Die Administration ist momentan nicht erreichbar. Ich kann häufige Fragen beantworten oder Ihre Nachricht weiterleiten.",
    fallback:
      "Ich habe keine genaue Antwort gefunden. Sie können der Administration eine Nachricht hinterlassen.",
    leaveMessage: "Nachricht hinterlassen",
    quickQuestions: [
      "Wann findet das Training statt?",
      "Wie kann ich Mitglied werden?",
      "Wo befindet sich das Stadion?",
      "Wie hoch ist der Mitgliedsbeitrag?",
      "Eine verantwortliche Person kontaktieren",
    ],
    answers: {
      training:
        "Das Training findet samstags von 17:00 bis 19:00 Uhr statt.",
      location:
        "Die Aktivitäten finden im Schönbergstadion, Wiesentalstraße 2, 79115 Freiburg im Breisgau, statt.",
      membership:
        "Um Mitglied zu werden, nutzen Sie das Anmeldeformular auf der Website. Das Damba-Team wird Sie anschließend kontaktieren.",
      fees:
        "Informationen zum Mitgliedsbeitrag erhalten Sie bei der Anmeldung oder von einer verantwortlichen Person des Vereins.",
      contact:
        "Sie können hier eine Nachricht hinterlassen. Sie wird an infos@dambasv-freiburg.de weitergeleitet.",
      activities:
        "Damba SV Freiburg bietet Fußball, Integration, Solidarität, Bildung und Aktivitäten für Jugendliche an.",
    },
    formTitle: "Nachricht hinterlassen",
    formDescription:
      "Ihre Nachricht wird an die Verwaltung von Damba SV Freiburg weitergeleitet.",
    name: "Name",
    email: "E-Mail-Adresse",
    message: "Nachricht",
    sending: "Wird gesendet…",
    success: "Ihre Nachricht wurde erfolgreich gesendet.",
    error: "Die Nachricht konnte nicht gesendet werden.",
  },
} as const;

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getAutomaticAnswer(question: string, language: Language) {
  const text = normalize(question);
  const answers = content[language].answers;

  if (
    text.includes("entrainement") ||
    text.includes("training") ||
    text.includes("samedi") ||
    text.includes("saturday") ||
    text.includes("wann") ||
    text.includes("uhr")
  ) {
    return answers.training;
  }

  if (
    text.includes("adresse") ||
    text.includes("stade") ||
    text.includes("stadium") ||
    text.includes("stadion") ||
    text.includes("lieu") ||
    text.includes("where") ||
    text.includes("wo ")
  ) {
    return answers.location;
  }

  if (
    text.includes("membre") ||
    text.includes("adhesion") ||
    text.includes("inscription") ||
    text.includes("member") ||
    text.includes("join") ||
    text.includes("mitglied") ||
    text.includes("anmeld")
  ) {
    return answers.membership;
  }

  if (
    text.includes("prix") ||
    text.includes("tarif") ||
    text.includes("cotisation") ||
    text.includes("fee") ||
    text.includes("cost") ||
    text.includes("beitrag") ||
    text.includes("kosten")
  ) {
    return answers.fees;
  }

  if (
    text.includes("contact") ||
    text.includes("responsable") ||
    text.includes("admin") ||
    text.includes("email") ||
    text.includes("e-mail")
  ) {
    return answers.contact;
  }

  if (
    text.includes("activite") ||
    text.includes("activity") ||
    text.includes("activities") ||
    text.includes("angebot")
  ) {
    return answers.activities;
  }

  return content[language].fallback;
}

export default function DambaChatbot() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("fr");
  const [step, setStep] = useState<Step>("chat");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [formStatus, setFormStatus] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = content[language];

  useEffect(() => {
    setMessages([
      {
        id: Date.now(),
        sender: "bot",
        text: t.welcome,
      },
      {
        id: Date.now() + 1,
        sender: "bot",
        text: t.unavailable,
      },
    ]);
    setStep("chat");
    setFormStatus("");
  }, [language, t.unavailable, t.welcome]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, open]);

  function submitQuestion(question: string) {
    const cleanedQuestion = question.trim();

    if (!cleanedQuestion) {
      return;
    }

    const now = Date.now();

    setMessages((current) => [
      ...current,
      {
        id: now,
        sender: "user",
        text: cleanedQuestion,
      },
      {
        id: now + 1,
        sender: "bot",
        text: getAutomaticAnswer(cleanedQuestion, language),
      },
    ]);

    setInput("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion(input);
  }

  function handleInputKeyDown(
    event: KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitQuestion(input);
    }
  }

  async function handleContactSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setSending(true);
    setFormStatus("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message: contactMessage,
          website: "",
        }),
      });

      const result = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || t.error);
      }

      setFormStatus(t.success);
      setName("");
      setEmail("");
      setContactMessage("");
    } catch (error) {
      setFormStatus(
        error instanceof Error ? error.message : t.error
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="damba-chatbot">
      {open && (
        <section
          className="damba-chatbot-window"
          role="dialog"
          aria-label={t.title}
        >
          <header className="damba-chatbot-header">
            <div>
              <strong>{t.title}</strong>
              <span>
                <i />
                {t.status}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.close}
            >
              ×
            </button>
          </header>

          <div className="damba-chatbot-languages">
            {(["fr", "en", "de"] as Language[]).map(
              (code) => (
                <button
                  key={code}
                  type="button"
                  className={
                    language === code ? "active" : ""
                  }
                  onClick={() => setLanguage(code)}
                >
                  {code.toUpperCase()}
                </button>
              )
            )}
          </div>

          {step === "chat" ? (
            <>
              <div className="damba-chatbot-messages">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`damba-chatbot-message ${message.sender}`}
                  >
                    {message.text}
                  </div>
                ))}

                <div ref={messagesEndRef} />
              </div>

              <div className="damba-chatbot-quick">
                {t.quickQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => submitQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="damba-chatbot-contact"
                onClick={() => setStep("contact")}
              >
                {t.leaveMessage}
              </button>

              <form
                className="damba-chatbot-input"
                onSubmit={handleSubmit}
              >
                <input
                  value={input}
                  onChange={(event) =>
                    setInput(event.target.value)
                  }
                  onKeyDown={handleInputKeyDown}
                  placeholder={t.placeholder}
                  aria-label={t.placeholder}
                />

                <button type="submit">
                  {t.send}
                </button>
              </form>
            </>
          ) : (
            <div className="damba-chatbot-contact-panel">
              <button
                type="button"
                className="damba-chatbot-back"
                onClick={() => setStep("chat")}
              >
                ← {t.back}
              </button>

              <h3>{t.formTitle}</h3>
              <p>{t.formDescription}</p>

              <form onSubmit={handleContactSubmit}>
                <label>
                  {t.name}
                  <input
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    minLength={2}
                    maxLength={120}
                    required
                  />
                </label>

                <label>
                  {t.email}
                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    maxLength={200}
                    required
                  />
                </label>

                <label>
                  {t.message}
                  <textarea
                    value={contactMessage}
                    onChange={(event) =>
                      setContactMessage(event.target.value)
                    }
                    minLength={10}
                    maxLength={5000}
                    rows={4}
                    required
                  />
                </label>

                {formStatus && (
                  <p className="damba-chatbot-form-status">
                    {formStatus}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                >
                  {sending ? t.sending : t.send}
                </button>
              </form>
            </div>
          )}
        </section>
      )}

      <button
        type="button"
        className="damba-chatbot-launcher"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? t.close : t.open}
      >
        {open ? (
          <X size={27} strokeWidth={2.2} aria-hidden="true" />
        ) : (
          <MessageCircle
            size={27}
            strokeWidth={2.2}
            aria-hidden="true"
          />
        )}
      </button>
    </div>
  );
}
