import { useEffect, useRef, useState } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import Notebook from "./Notebook";
import { loadSessions, storageKey } from "./sessionStorage";

export type IconName =
  | "arrow"
  | "plus"
  | "book"
  | "bulb"
  | "check"
  | "chevron"
  | "clock"
  | "code"
  | "leaf"
  | "back"
  | "send"
  | "message"
  | "close"
  | "refresh";
export type StudentIcon = "user";

export function Icon({ name, size = 20 }: { name: IconName | StudentIcon; size?: number }) {
  const paths: Record<IconName | StudentIcon, ReactNode> = {
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
      </>
    ),
    arrow: (
      <>
        <path d="M4 12h15M13 5l7 7-7 7" />
      </>
    ),
    back: (
      <>
        <path d="M20 12H5m6-7-7 7 7 7" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    book: (
      <>
        <path d="M12 5C8 2 3 4 3 4v15s5-2 9 1c4-3 9-1 9-1V4s-5-2-9 1v15" />
      </>
    ),
    bulb: (
      <>
        <path d="M9 18h6m-5 3h4M8 14a6 6 0 1 1 8 0c-1 .8-1 2-1 2H9s0-1.2-1-2Z" />
        <path d="M10 7c-1 0-2 1-2 2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    code: (
      <>
        <path d="m7 7-5 5 5 5m10-10 5 5-5 5m-4-13-2 16" />
      </>
    ),
    leaf: (
      <>
        <path d="M19 3C7 2 2 8 6 15c7 5 15-1 13-12Z" />
        <path d="M4 21 15 9m-7 8v-5m3 1h5" />
      </>
    ),
    send: (
      <>
        <path d="m21 3-6 18-4-8-8-4 18-6ZM11 13 21 3" />
      </>
    ),
    message: <path d="M21 11a8 8 0 0 1-8 8H7l-5 3 1-7a8 8 0 0 1-1-4 9 9 0 0 1 19 0Z" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    refresh: (
      <>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M6 7a7 7 0 0 1 12-1l2 6M4 12l2 6a7 7 0 0 0 12-1" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export function Mark({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand-mark ${small ? "small" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path
          d="M8 23V11a4 4 0 0 1 8 0v12m0-8h5a4 4 0 1 0-4-4v12M8 17h8"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="23" cy="23" r="2" fill="currentColor" />
      </svg>
    </span>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "text";
  children: ReactNode;
}) {
  return (
    <button className={`button ${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

export type Page = "problem" | "work" | "summary";
export type Message = { kind: string; text: string; studentText?: string };

export type Draft = {
  subject: string;
  exercise: string;
  goal: string;
  attempt: string;
  answer: string;
  reflection: string;
  messages: Message[];
  helps: string[];
  sent: number;
  finished: boolean;
  turns: { text: string; messages: Message[] }[];
  openingMessages: Message[];
  nextAttempt: string;
  editDraft: { index: number; text: string } | null;
  precisionDraft: string;
};

const initialExercise = "Écrire une fonction qui calcule la moyenne d’une liste non vide de nombres.";

const initial: Draft = {
  subject: "Programmation Python",
  exercise: initialExercise,
  goal: "Résoudre un exercice",
  attempt: "",
  answer: "",
  reflection: "",
  messages: [],
  helps: [],
  sent: 0,
  finished: false,
  turns: [],
  openingMessages: [],
  nextAttempt: "",
  editDraft: null,
  precisionDraft: "",
};

export const helpTexts: Record<string, string> = {
  "Un indice":
    "Tu connais la somme des valeurs. Quelle information sur la liste te permettrait de répartir cette somme de façon équitable entre tous les éléments ?",
  "Un exemple":
    "Prenons deux nombres simples : 10 et 20. Leur somme est 30. Comme il y a 2 nombres, la moyenne est 30 divisé par 2 = 15.",
  "Expliquer la notion":
    "La moyenne s’obtient en divisant la somme totale des valeurs par le nombre d’éléments (leur effectif). La formule est : Moyenne = Total / Nombre d'éléments.",
  "Pour commencer":
    "Commençons avec une étape à la fois : pour calculer la moyenne d'une liste de nombres, quelle est la toute première opération que tu ferais ?",
  "Plus simple":
    "Imagine que tu partages 30 euros à parts égales entre 2 personnes. Chacune reçoit 15 euros. La moyenne, c’est exactement cette part égale obtenue après division !",
  "Approfondir":
    "En Python, `sum(nombres)` calcule la somme totale et `len(nombres)` donne le nombre d’éléments. Quelle ligne de code simple permettrait de combiner ces deux fonctions ?",
};

export function Stepper({
  currentStep,
  onStepClick,
}: {
  currentStep: Page;
  onStepClick: (step: Page) => void;
}) {
  const steps: { id: Page; number: string; label: string }[] = [
    { id: "problem", number: "01", label: "Mon problème" },
    { id: "work", number: "02", label: "Raisonnement" },
    { id: "summary", number: "03", label: "Bilan" },
  ];

  const order: Record<Page, number> = {
    problem: 0,
    work: 1,
    summary: 2,
  };

  const currentIdx = order[currentStep];

  return (
    <nav className="stepper-banner" aria-label="Étapes de la séance">
      <div className="stepper-inner">
        {steps.map((step, idx) => {
          const isActive = idx === currentIdx;
          const isCompleted = idx < currentIdx;
          const isUpcoming = idx > currentIdx;

          return (
            <div className="stepper-item-wrap" key={step.id}>
              <button
                type="button"
                className={`stepper-step ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""} ${isUpcoming ? "upcoming" : ""}`}
                onClick={() => onStepClick(step.id)}
                aria-current={isActive ? "step" : undefined}
                title={`Aller à l'étape ${step.number} : ${step.label}`}
              >
                <span className="stepper-badge">
                  {isCompleted ? <Icon name="check" size={16} /> : step.number}
                </span>
                <span className="stepper-label">{step.label}</span>
              </button>
              {idx < steps.length - 1 && (
                <div
                  className={`stepper-connector ${idx < currentIdx ? "completed" : ""}`}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("problem");
  const [activeId, setActiveId] = useState(() => crypto.randomUUID());
  const [sessions, setSessions] = useState(() => loadSessions(initial).sessions);
  const [draft, setDraft] = useState<Draft>(() => initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState<Message | null>(null);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Silent session persistence (no popup, no warning alert)
  useEffect(() => {
    try {
      const entry = { id: activeId, updatedAt: new Date().toISOString(), data: draft };
      const updated = [entry, ...sessions.filter((s) => s.id !== activeId)];
      setSessions(updated);
      localStorage.setItem(storageKey, JSON.stringify({ activeId, sessions: updated }));
    } catch {
      // Storage silently ignored if disabled in private mode
    }
  }, [draft, activeId]);

  useEffect(() => {
    titleRef.current?.focus();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [page]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  function respond(message: Message) {
    if (busy) return;
    setPending(message);
    setError(false);
    setBusy(true);

    timer.current = setTimeout(() => {
      setBusy(false);
      setDraft((d) => ({
        ...d,
        messages: [...d.messages, message],
        turns: d.turns.map((turn, i) =>
          i === d.turns.length - 1 ? { ...turn, messages: [...turn.messages, message] } : turn,
        ),
        openingMessages: d.turns.length ? d.openingMessages : [...d.openingMessages, message],
        helps:
          message.kind === "Retour sur ta tentative"
            ? d.helps
            : [...new Set([...d.helps, message.kind])],
      }));
      setPending(null);
    }, 850);
  }

  function sendAttempt(customText?: string) {
    const text = (customText || (draft.turns.length ? draft.nextAttempt : draft.attempt)).trim();
    if (!text || busy || error) return;
    const isImproved = /divis|\/|répart|nombre d|len\(/i.test(text);

    setDraft((d) => ({
      ...d,
      attempt: text,
      nextAttempt: "",
      sent: d.sent + 1,
      turns: [...d.turns, { text, messages: [] }],
    }));

    respond({
      kind: "Retour sur ta tentative",
      text: isImproved
        ? "Ta démarche décrit bien le calcul d’une moyenne ! Tu as identifié le partage par le nombre d’éléments. Comment formulerais-tu cela clairement sous forme de code ou d'étape mathématique ?"
        : draft.sent > 0
          ? "La somme permet d'obtenir le total. Pour calculer la moyenne, il faut maintenant diviser ce total par le nombre d’éléments. Comment pourrais-tu exprimer cette division ?"
          : "Tu as identifié une première étape clé : additionner les valeurs. Quelle différence fais-tu entre une simple somme et une moyenne ?",
    });
  }

  function newSession() {
    if (timer.current) clearTimeout(timer.current);
    setActiveId(crypto.randomUUID());
    setDraft({
      ...initial,
      exercise: initialExercise,
    });
    setBusy(false);
    setError(false);
    setPending(null);
    setPage("problem");
  }

  const sessionTitle = draft.subject.toLowerCase().includes("python")
    ? "Comprendre une moyenne en Python"
    : `Séance de ${draft.subject}`;

  return (
    <div className="app">
      {/* Header with Brand and Clean Controls (No "Accueil", No "Mes séances") */}
      <header className="header">
        <div className="header-inner">
          <div className="brand" aria-label="ThinkFirst">
            <Mark />
            <span>
              Think<span className="brand-light">First</span>
              <span className="brand-dot">.</span>
            </span>
          </div>
          <div className="header-center">
            <span className="header-tagline">Accompagnement pédagogique interactif</span>
          </div>
          <div className="header-right">
            <Button variant="secondary" onClick={newSession} className="new-session-btn">
              <Icon name="plus" size={16} />
              Nouvelle séance
            </Button>
            <span className="avatar" aria-label="Espace étudiant" title="Étudiant">
              É
            </span>
          </div>
        </div>
      </header>

      {/* Main Flow: Stepper is displayed identically across each step */}
      <main className="session-main">
        {/* Identical Stepper Component on Every Page */}
        <Stepper currentStep={page} onStepClick={setPage} />

        {/* STEP 1: Mon problème */}
        {page === "problem" && (
          <section className="form-layout" aria-label="Étape 1 : Mon problème">
            <div className="form-intro">
              <span className="section-icon">
                <Icon name="book" size={26} />
              </span>
              <h1 ref={titleRef} tabIndex={-1}>
                Posons le point de départ.
              </h1>
              <p>
                Partage ton exercice et ton objectif. ThinkFirst t'accompagne à construire ton
                raisonnement pas à pas, sans donner la réponse toute faite.
              </p>
              <div className="soft-note">
                <Icon name="bulb" />
                <p>
                  Pas besoin d’un énoncé parfait.
                  <br />
                  L’important, c’est ta question et ton point de départ.
                </p>
              </div>
            </div>

            <form
              className="panel problem-form"
              onSubmit={(e) => {
                e.preventDefault();
                setPage("work");
              }}
            >
              <div className="field">
                <label htmlFor="subject">Matière ou discipline</label>
                <input
                  id="subject"
                  required
                  value={draft.subject}
                  onChange={(e) => update("subject", e.target.value)}
                  placeholder="Ex : Programmation Python, Mathématiques..."
                />
              </div>

              <div className="field">
                <label htmlFor="exercise">Énoncé de l’exercice ou problème</label>
                <p className="field-hint">
                  Copie l’énoncé ou décris ce que tu cherches à accomplir avec tes mots.
                </p>
                <textarea
                  id="exercise"
                  required
                  rows={4}
                  value={draft.exercise}
                  onChange={(e) => update("exercise", e.target.value)}
                  placeholder="Écris l'exercice ici..."
                />
              </div>

              <fieldset className="field">
                <legend>Objectif de la séance</legend>
                <div className="goal-options">
                  {["Comprendre une notion", "Résoudre un exercice", "Approfondir un sujet"].map(
                    (goal) => (
                      <label
                        className={`goal-option ${draft.goal === goal ? "selected" : ""}`}
                        key={goal}
                      >
                        <input
                          type="radio"
                          name="goal"
                          value={goal}
                          checked={draft.goal === goal}
                          onChange={() => update("goal", goal)}
                        />
                        <span>{goal}</span>
                      </label>
                    ),
                  )}
                </div>
              </fieldset>

              <div className="form-bottom">
                <span>Tu pourras revenir adapter ces éléments à tout moment.</span>
                <Button type="submit">
                  Commencer à réfléchir <Icon name="arrow" size={17} />
                </Button>
              </div>
            </form>
          </section>
        )}

        {/* STEP 2: Raisonnement (ChatGPT-style dialogue) */}
        {page === "work" && (
          <section className="work-layout" aria-label="Étape 2 : Raisonnement">
            <Notebook
              draft={draft}
              busy={busy}
              error={error}
              pending={pending}
              onDraft={(value) => update(draft.turns.length ? "nextAttempt" : "attempt", value)}
              onSend={sendAttempt}
              onRespond={respond}
              onRetry={() => pending && respond(pending)}
              onGoToSummary={() => setPage("summary")}
            />
          </section>
        )}

        {/* STEP 3: Bilan */}
        {page === "summary" && (
          <section className="summary-layout" aria-label="Étape 3 : Bilan">
            <div className="summary-heading">
              <span className="section-icon">
                <Icon name="leaf" size={28} />
              </span>
              <h1 ref={titleRef} tabIndex={-1}>
                Bilan de ta séance
              </h1>
              <p>Prends un moment pour ancrer ce que tu as appris et reformuler ta démarche.</p>
            </div>

            <div className="summary-cards">
              <div className="summary-card">
                <Icon name="book" size={22} />
                <span className="mini-label">NOTION TRAVAILLÉE</span>
                <h3>{draft.subject}</h3>
                <p>Calcul et interprétation d’une moyenne</p>
              </div>

              <div className="summary-card">
                <Icon name="bulb" size={22} />
                <span className="mini-label">DÉCLIC CLÉ</span>
                <h3>Distinguer somme et moyenne</h3>
                <p>
                  {draft.sent > 0
                    ? "La moyenne s'obtient en divisant la somme totale par le nombre d’éléments."
                    : "Une distinction essentielle à mémoriser pour ce type d'exercice."}
                </p>
              </div>

              <div className="summary-card">
                <Icon name="message" size={22} />
                <span className="mini-label">AIDES MOBILISÉES</span>
                <h3>
                  {draft.helps.length
                    ? draft.helps
                        .map((h) =>
                          h === "Un indice"
                            ? "Indice"
                            : h === "Un exemple"
                              ? "Exemple"
                              : h === "Expliquer la notion"
                                ? "Explication"
                                : h,
                        )
                        .join(", ")
                    : "Raisonnement autonome"}
                </h3>
                <p>
                  {draft.helps.length
                    ? "Ressources consultées au fil des échanges."
                    : "Tu as résolu cet exercice de façon entièrement autonome !"}
                </p>
              </div>
            </div>

            <div className="panel reflection-panel">
              <label htmlFor="reflection">
                Comment expliquerais-tu la méthode avec tes propres mots ?
              </label>
              <p>
                Ce qui est plus clair, la formule ou la démarche à retenir… cet espace t'appartient.
              </p>
              <textarea
                id="reflection"
                rows={4}
                value={draft.reflection}
                onChange={(e) => update("reflection", e.target.value)}
                placeholder="Pour calculer une moyenne, je commence par additionner toutes les valeurs, puis je divise ce total par le nombre d'éléments..."
              />
              <div className="reflection-note">
                <Icon name="leaf" size={17} />
                Une séance est une étape vers la maîtrise. Tu peux approfondir cette notion quand tu le souhaites.
              </div>
            </div>

            <div className="summary-actions">
              <button
                type="button"
                className="text-link subdued"
                onClick={() => setPage("work")}
              >
                <Icon name="back" size={16} />
                Revenir au raisonnement
              </button>
              <Button onClick={newSession}>
                <Icon name="plus" size={17} />
                Nouvelle séance
              </Button>
            </div>
          </section>
        )}

        <div className="session-footnote">
          <Icon name="leaf" size={15} />
          Le bon rythme, c’est le tien.
        </div>
      </main>
    </div>
  );
}
