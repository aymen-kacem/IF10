import { useEffect, useRef, useState } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import Notebook from "./Notebook";
import { loadSessions, storageKey } from "./sessionStorage";
import type { SavedSession } from "./sessionStorage";

type IconName =
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
type StudentIcon = "user";
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
      strokeWidth="1.65"
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
type Page = "home" | "sessions" | "problem" | "work" | "check" | "summary";
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
const original =
  "Je peux additionner les nombres de la liste. Je pense que cette somme correspond à la moyenne.";
const improved = "J’additionne les valeurs, puis je divise le total par le nombre d’éléments.";
const initial: Draft = {
  subject: "Programmation Python",
  exercise: "Écrire une fonction qui calcule la moyenne d’une liste non vide de nombres.",
  goal: "Résoudre un exercice",
  attempt: original,
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
    "Tu connais la somme des valeurs. Quelle information sur la liste te permettrait de répartir cette somme entre les éléments ?",
  "Un exemple":
    "Pour les nombres 10 et 20, la somme est 30. Quelle valeur représenterait leur moyenne ?",
  "Expliquer la notion":
    "La moyenne s’obtient en divisant la somme des valeurs par leur nombre. Ici, la liste étant non vide, ce nombre est supérieur à zéro.",
  "Pour commencer":
    "Commençons avec deux nombres : 10 et 20. Quelle opération permet de connaître leur total ?",
  "Plus simple":
    "Imagine que tu partages 30 euros à parts égales entre 2 personnes. Chacune reçoit 15 euros. La moyenne, c’est cette part égale.",
  Approfondir:
    "En Python, sum(nombres) donne le total et len(nombres) donne le nombre d’éléments. Comment combiner ces deux opérations dans une fonction ?",
};
export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [library] = useState(() => loadSessions(initial));
  const [activeId, setActiveId] = useState(library.activeId);
  const [sessions, setSessions] = useState(library.sessions);
  const [draft, setDraft] = useState<Draft>(
    () => library.sessions.find((s) => s.id === library.activeId)!.data,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const [pending, setPending] = useState<Message | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "incomplete" | null>(null);
  const [clarify, setClarify] = useState(false);
  const [toast, setToast] = useState("");
  const titleRef = useRef<HTMLHeadingElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [storageAvailable, setStorageAvailable] = useState(true);
  useEffect(() => {
    setSessions((previous) => {
      const entry = { id: activeId, updatedAt: new Date().toISOString(), data: draft };
      return [entry, ...previous.filter((s) => s.id !== activeId)];
    });
  }, [draft, activeId]);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ activeId, sessions }));
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
  }, [sessions, activeId]);
  useEffect(() => {
    titleRef.current?.focus();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [page]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));
  function respond(message: Message, retry = false) {
    if (busy) return;
    setPending(message);
    setError(false);
    setBusy(true);
    timer.current = setTimeout(() => {
      setBusy(false);
      if (simulateError && !retry) {
        setError(true);
        setSimulateError(false);
        return;
      }
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
    }, 1000);
  }
  function sendAttempt() {
    const text = (draft.turns.length ? draft.nextAttempt : draft.attempt).trim();
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
        ? "Ta démarche décrit le calcul d’une moyenne. Vérifions maintenant comment tu l’appliques."
        : draft.sent > 0
          ? "La somme est le total de toutes les valeurs. Pour obtenir la moyenne, on divise ce total par le nombre d’éléments. Tu peux maintenant préciser comment tu ferais ce partage."
          : "Tu as identifié une première étape : additionner les valeurs. Quelle différence fais-tu entre une somme et une moyenne ?",
    });
  }
  function newSession() {
    resetSession();
  }
  function resetSession() {
    if (timer.current) clearTimeout(timer.current);
    setActiveId(crypto.randomUUID());
    setDraft({
      ...initial,
      attempt: "",
      exercise: "Écrire une fonction qui calcule la moyenne d’une liste non vide de nombres.",
    });
    setBusy(false);
    setError(false);
    setPending(null);
    setFeedback(null);
    setClarify(false);
    setPage("problem");
  }
  function resumeSession(session: SavedSession) {
    if (timer.current) clearTimeout(timer.current);
    setBusy(false);
    setError(false);
    setPending(null);
    setFeedback(null);
    setClarify(false);
    setActiveId(session.id);
    setDraft(session.data);
    setPage(
      session.data.finished
        ? "summary"
        : session.data.turns.length || session.data.openingMessages.length
          ? "work"
          : "problem",
    );
  }
  function verify() {
    const text = draft.answer.toLowerCase();
    const result = /(^|[^\d])10([^\d]|$)|dix/.test(text);
    const method =
      /divis|\/|partag|répart/.test(text) &&
      /3|trois/.test(text) &&
      /30|trente|6\s*\+\s*9/.test(text);
    setFeedback(result && method ? "correct" : "incomplete");
  }
  const inSession = ["problem", "work", "check", "summary"].includes(page);
  const step = page === "problem" ? 0 : page === "summary" ? 2 : 1;
  const sessionTitle = draft.subject.toLowerCase().includes("python")
    ? "Comprendre une moyenne en Python"
    : `Séance de ${draft.subject.toLowerCase()}`;
  const sessionCard = (session: SavedSession) => (
    <article className="session-card" key={session.id}>
      <div className="subject-icon">
        <Icon name="code" size={25} />
      </div>
      <div className="session-info">
        <div className="session-tags">
          <span className="subject-tag">{session.data.subject}</span>
          <span className={`status-tag ${session.data.finished ? "complete" : ""}`}>
            <span />
            {session.data.finished ? "Terminée" : "En cours"}
          </span>
        </div>
        <h3>
          {session.data.subject.toLowerCase().includes("python")
            ? "Comprendre une moyenne en Python"
            : `Séance de ${session.data.subject.toLowerCase()}`}
        </h3>
        <p>
          <Icon name="clock" size={14} />
          {new Intl.DateTimeFormat("fr-FR", {
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(session.updatedAt))}
        </p>
      </div>
      <Button variant="secondary" onClick={() => resumeSession(session)}>
        Reprendre <Icon name="arrow" size={17} />
      </Button>
    </article>
  );

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <button
            className="brand"
            onClick={() => setPage("home")}
            aria-label="ThinkFirst, accueil"
          >
            <Mark />
            <span>
              Think<span className="brand-light">First</span>
              <span className="brand-dot">.</span>
            </span>
          </button>
          <nav aria-label="Navigation principale">
            <button
              className={page === "home" ? "nav-link active" : "nav-link"}
              aria-current={page === "home" ? "page" : undefined}
              onClick={() => setPage("home")}
            >
              Accueil
            </button>
            <button
              className={page === "sessions" ? "nav-link active" : "nav-link"}
              aria-current={page === "sessions" ? "page" : undefined}
              onClick={() => setPage("sessions")}
            >
              Mes séances
            </button>
          </nav>
          <div className="header-right">
            <span className="student-label">Ton espace pour apprendre</span>
            <Button variant="secondary" onClick={newSession}>
              <Icon name="plus" size={17} />
              Nouvelle séance
            </Button>
            <span className="avatar" aria-label="Espace étudiant">
              É
            </span>
          </div>
        </div>
      </header>

      {(page === "home" || page === "sessions") && (
        <main className="home-main">
          {page === "home" ? (
            <>
              <div className="welcome">
                <span className="eyebrow">
                  <span className="tiny-line" />
                  PRENDRE LE TEMPS DE COMPRENDRE
                </span>
                <span className="quiet-label">
                  <Icon name="leaf" size={15} />À ton rythme, toujours.
                </span>
              </div>
              <section className="hero">
                <div className="hero-content">
                  <div className="pill">
                    <span />
                    Un espace pour tes idées
                  </div>
                  <h1 ref={titleRef} tabIndex={-1}>
                    Sur quoi souhaites-tu
                    <br /> <span>travailler ?</span>
                  </h1>
                  <p>
                    Construis ton raisonnement avec des questions,
                    <br className="desktop-break" /> des indices et des explications adaptés.
                  </p>
                  <Button onClick={newSession}>
                    Commencer une séance <Icon name="arrow" size={19} />
                  </Button>
                  <div className="hero-note">
                    <Icon name="check" size={15} />
                    Pas besoin d’avoir déjà la réponse.
                  </div>
                </div>
                <div
                  className="hero-art"
                  aria-label="De la première idée à la compréhension, un pas à la fois"
                >
                  <div className="art-orbit orbit-one" />
                  <div className="art-orbit orbit-two" />
                  <svg
                    className="art-star star-one"
                    width="34"
                    height="34"
                    viewBox="0 0 34 34"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path d="M17 1v32M1 17h32M6 6l22 22M6 28 28 6" />
                  </svg>
                  <div className="thought-card thought-first">
                    <span className="thought-number">01</span>
                    <div>
                      <span className="art-label">LE POINT DE DÉPART</span>
                      <strong>« J’ai une première idée… »</strong>
                      <div className="art-lines">
                        <i />
                        <i />
                      </div>
                    </div>
                    <span className="thought-symbol">
                      <Icon name="message" size={21} />
                    </span>
                  </div>
                  <div className="art-connector">
                    <svg viewBox="0 0 230 80" fill="none">
                      <path
                        d="M15 0v26q0 17 18 17h157q20 0 20 20v12m-5-6 5 6 5-6"
                        stroke="#9cae98"
                        strokeWidth="1.5"
                        strokeDasharray="4 5"
                      />
                    </svg>
                  </div>
                  <div className="thought-card thought-second">
                    <span className="thought-number">02</span>
                    <div>
                      <span className="art-label">LE DÉCLIC</span>
                      <strong>Comprendre, pas à pas.</strong>
                      <div className="art-progress">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                    <span className="thought-symbol sage">
                      <Icon name="bulb" size={23} />
                    </span>
                  </div>
                  <div className="art-caption">
                    <span className="caption-line" />
                    Ton raisonnement fait le chemin.
                  </div>
                  <span className="art-dot dot-one" />
                  <span className="art-dot dot-two" />
                </div>
              </section>
              <section className="resume-section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">ON CONTINUE ?</span>
                    <h2>Reprendre une séance</h2>
                  </div>
                  <button className="text-link" onClick={() => setPage("sessions")}>
                    Toutes mes séances <Icon name="arrow" size={17} />
                  </button>
                </div>
                {sessionCard(sessions[0])}
              </section>
              <section className="approach">
                <div className="approach-heading">
                  <span className="eyebrow">LA MÉTHODE THINKFIRST</span>
                  <h2>
                    Pas une réponse toute faite.
                    <br />
                    Un chemin pour comprendre.
                  </h2>
                  <p>Tu réfléchis. On t’accompagne.</p>
                </div>
                <div className="approach-items">
                  {[
                    {
                      n: "01",
                      icon: "message",
                      title: "Pars de ce que tu sais",
                      text: "Une intuition, une question ou un début de solution : tout commence là.",
                    },
                    {
                      n: "02",
                      icon: "bulb",
                      title: "Avance avec la bonne aide",
                      text: "Un indice, un exemple ou une explication. Tu choisis ce qui t’aide.",
                    },
                    {
                      n: "03",
                      icon: "leaf",
                      title: "Fais le point, à ta façon",
                      text: "Reformule avec tes mots pour voir ce qui est devenu plus clair.",
                    },
                  ].map((item) => (
                    <div className="approach-item" key={item.n}>
                      <div className="approach-item-top">
                        <span className="method-icon">
                          <Icon name={item.icon as IconName} size={22} />
                        </span>
                        <span className="method-number">{item.n}</span>
                      </div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <>
              <div className="page-heading">
                <span className="eyebrow">TON ESPACE D’APPRENTISSAGE</span>
                <h1 ref={titleRef} tabIndex={-1}>
                  Mes séances
                </h1>
                <p>Retrouve tes idées et poursuis ton chemin, à ton rythme.</p>
              </div>
              <div className="session-list">{sessions.map(sessionCard)}</div>
              <div className="sessions-tip">
                <Icon name="book" />
                <p>
                  Chaque séance est un espace pour explorer une question.
                  <br />
                  Tu peux revenir sur ton raisonnement à tout moment.
                </p>
                <Button variant="secondary" onClick={newSession}>
                  <Icon name="plus" size={17} />
                  Commencer une séance
                </Button>
              </div>
            </>
          )}
          <footer className="footer">
            <span>
              <Mark small />
              Réfléchir d’abord. Comprendre durablement.
            </span>
            <span>Un accompagnement, pas un raccourci.</span>
          </footer>
        </main>
      )}

      {inSession && (
        <main className="session-main">
          <div className="session-title-line">
            <div>
              <span className="eyebrow">TON ESPACE DE RÉFLEXION</span>
              <h1 ref={titleRef} tabIndex={-1}>
                {sessionTitle}
              </h1>
            </div>
          </div>
          <nav className="progress-banner" aria-label="Étapes de la séance">
            {["Mon problème", "Mon raisonnement", "Mon bilan"].map((label, i) => (
              <div className="progress-item" key={label}>
                <button
                  className={`progress-step ${step === i ? "active" : step > i ? "completed" : "upcoming"}`}
                  aria-current={step === i ? "step" : undefined}
                  onClick={() => setPage((["problem", "work", "summary"] as Page[])[i])}
                >
                  <span className="progress-number">{`0${i + 1}`}</span>
                  <span>{label}</span>
                  <span className="progress-check">
                    {step > i && <Icon name="check" size={16} />}
                  </span>
                  <span className="sr-only">
                    {step > i
                      ? ", étape terminée"
                      : step < i
                        ? ", étape suivante"
                        : ", étape active"}
                  </span>
                </button>
                {i < 2 && (
                  <span className="progress-separator" aria-hidden="true">
                    —
                  </span>
                )}
              </div>
            ))}
          </nav>
          {!storageAvailable && (
            <p className="storage-warning" role="alert">
              L’enregistrement local est indisponible. Garde cette page ouverte pour conserver tes
              échanges.
            </p>
          )}

          {page === "problem" && (
            <section className="form-layout">
              <div className="form-intro">
                <span className="section-icon">
                  <Icon name="book" size={25} />
                </span>
                <h2>Posons le point de départ.</h2>
                <p>
                  Partage ton exercice et ce que tu souhaites en retirer. On avance ensuite
                  ensemble.
                </p>
                <div className="soft-note">
                  <Icon name="bulb" />
                  <p>
                    Pas besoin d’un énoncé parfait.
                    <br />
                    L’important, c’est ta question.
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
                  <label htmlFor="subject">Matière</label>
                  <input
                    id="subject"
                    required
                    value={draft.subject}
                    onChange={(e) => update("subject", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="exercise">Énoncé de l’exercice</label>
                  <p>Copie l’énoncé ou décris ton problème avec tes mots.</p>
                  <textarea
                    id="exercise"
                    required
                    rows={4}
                    value={draft.exercise}
                    onChange={(e) => update("exercise", e.target.value)}
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
                  <span>Tu pourras modifier ces informations.</span>
                  <Button type="submit">
                    Commencer à réfléchir <Icon name="arrow" size={17} />
                  </Button>
                </div>
              </form>
            </section>
          )}

          {page === "work" && (
            <Notebook
              draft={draft}
              busy={busy}
              error={error}
              clarify={clarify}
              pending={pending}
              simulateError={simulateError}
              onDraft={(value) => update(draft.turns.length ? "nextAttempt" : "attempt", value)}
              onEditDraft={(value) => update("editDraft", value)}
              onPrecisionDraft={(value) => update("precisionDraft", value)}
              onSend={sendAttempt}
              onEdit={(index, text) =>
                setDraft((d) => ({
                  ...d,
                  turns: d.turns.map((turn, i) => (i === index ? { ...turn, text } : turn)),
                  attempt: index === d.turns.length - 1 ? text : d.attempt,
                }))
              }
              onRespond={respond}
              onRetry={() => pending && respond(pending, true)}
              onClarify={setClarify}
              onCheck={() => {
                setFeedback(null);
                setPage("check");
              }}
              onSimulateError={setSimulateError}
            />
          )}

          {page === "check" && (
            <section className="check-layout">
              <div className="check-intro">
                <span className="eyebrow">UN PAS DE PLUS</span>
                <h2>
                  Et si on essayait
                  <br />
                  avec d’autres nombres ?
                </h2>
                <p>
                  Pas de note, pas de chronomètre.
                  <br />
                  Juste une occasion de vérifier ta démarche.
                </p>
                <div className="previous-attempt">
                  <span className="mini-label">TA DERNIÈRE TENTATIVE</span>
                  <p>« {draft.attempt || improved} »</p>
                  <button className="text-link" onClick={() => setPage("work")}>
                    Revenir la modifier <Icon name="arrow" size={15} />
                  </button>
                </div>
              </div>
              <div className="panel check-panel">
                <div className="check-assistant">
                  <Mark small />
                  <p>
                    Ta démarche{" "}
                    {/divis|\/|len\(/i.test(draft.attempt)
                      ? "décrit le calcul d’une moyenne. Vérifions maintenant comment tu l’appliques."
                      : "est un point de départ. Mettons-la à l’épreuve avec un exemple concret."}
                  </p>
                </div>
                <h3>Quelle est la moyenne de 6, 9 et 15 ?</h3>
                <p className="field-hint">Explique brièvement ta démarche.</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    verify();
                  }}
                >
                  <label className="sr-only" htmlFor="answer">
                    Ta réponse et ta démarche
                  </label>
                  <textarea
                    id="answer"
                    required
                    value={draft.answer}
                    onChange={(e) => {
                      update("answer", e.target.value);
                      setFeedback(null);
                    }}
                    placeholder="Je commence par…"
                    rows={5}
                  />
                  <Button type="submit">
                    Vérifier ma démarche <Icon name="check" size={18} />
                  </Button>
                </form>
                {feedback && (
                  <div className={`verification-feedback ${feedback}`} role="status">
                    <span className="message-label">
                      <Icon name={feedback === "correct" ? "check" : "bulb"} size={19} />
                      {feedback === "correct"
                        ? "Une démarche bien expliquée"
                        : "Précisons ta démarche"}
                    </span>
                    <p>
                      {feedback === "correct"
                        ? "Tu additionnes 6, 9 et 15 pour obtenir 30, puis tu divises par 3. La moyenne est bien 10. Tu as distingué le total du nombre d’éléments et expliqué le rôle de chacun."
                        : /10|dix/i.test(draft.answer)
                          ? "Tu as trouvé 10. Comment as-tu obtenu ce résultat ? Précise le total des valeurs et le nombre par lequel tu le divises."
                          : "Quel total obtiens-tu en additionnant 6, 9 et 15 ? Combien y a-t-il de valeurs pour partager ce total ?"}
                    </p>
                    {feedback === "incomplete" && (
                      <Button
                        variant="text"
                        onClick={() => {
                          setPage("work");
                          respond({
                            kind: "Un exemple",
                            text: "Pour 6, 9 et 15, le total est 30. Il y a 3 valeurs. La moyenne est le total partagé en 3 parts égales : quelle division peux-tu écrire ?",
                          });
                        }}
                      >
                        Recevoir une aide <Icon name="arrow" size={16} />
                      </Button>
                    )}
                  </div>
                )}
                <div className="check-bottom">
                  <button className="text-link subdued" onClick={() => setPage("work")}>
                    <Icon name="back" size={15} />
                    Mon raisonnement
                  </button>
                  <Button
                    variant={feedback === "correct" ? "primary" : "text"}
                    onClick={() => setPage("summary")}
                  >
                    Faire le bilan <Icon name="arrow" size={16} />
                  </Button>
                </div>
              </div>
            </section>
          )}

          {page === "summary" && (
            <section className="summary-layout">
              <div className="summary-heading">
                <span className="section-icon">
                  <Icon name="leaf" size={28} />
                </span>
                <h2>Fais le point sur ta séance.</h2>
                <p>Prends un moment pour regarder le chemin parcouru.</p>
              </div>
              <div className="summary-cards">
                {[
                  { icon: "book", label: "NOTION TRAVAILLÉE", text: "Calcul d’une moyenne" },
                  {
                    icon: "bulb",
                    label: "ÉTAPE CLARIFIÉE",
                    text: "Distinguer somme et moyenne",
                    note:
                      draft.sent || feedback === "correct"
                        ? "Un point à reformuler avec tes mots."
                        : "Un point à continuer d’explorer.",
                  },
                  {
                    icon: "message",
                    label: "AIDE CONSULTÉE",
                    text: draft.helps.length
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
                      : "Aucune aide pour le moment",
                  },
                ].map((item) => (
                  <div className="summary-card" key={item.label}>
                    <Icon name={item.icon as IconName} size={22} />
                    <span className="mini-label">{item.label}</span>
                    <h3>{item.text}</h3>
                    {item.note && <p>{item.note}</p>}
                  </div>
                ))}
              </div>
              <div className="panel reflection-panel">
                <label htmlFor="reflection">
                  Comment expliquerais-tu la méthode avec tes propres mots ?
                </label>
                <p>
                  Ce qui est plus clair, ce qui mérite encore d’être exploré… cet espace est à toi.
                </p>
                <textarea
                  id="reflection"
                  rows={4}
                  value={draft.reflection}
                  onChange={(e) => update("reflection", e.target.value)}
                  placeholder="Pour calculer une moyenne, je…"
                />
                <div className="reflection-note">
                  <Icon name="leaf" size={17} />
                  Une séance est une étape. Tu peux revenir sur cette notion quand tu le souhaites.
                </div>
              </div>
              <div className="summary-actions">
                <button className="text-link subdued" onClick={() => setPage("work")}>
                  <Icon name="back" size={16} />
                  Revenir à mon raisonnement
                </button>
                <div>
                  <Button variant="secondary" onClick={newSession}>
                    Essayer un autre exercice
                  </Button>
                  <Button
                    onClick={() => {
                      update("finished", true);
                      setPage("home");
                      setToast(
                        "Ta séance est terminée. Tu peux retrouver tes échanges dans « Mes séances ».",
                      );
                    }}
                  >
                    <Icon name="check" size={17} />
                    Terminer la séance
                  </Button>
                </div>
              </div>
            </section>
          )}
          <div className="session-footnote">
            <Icon name="leaf" size={15} />
            Le bon rythme, c’est le tien.
          </div>
        </main>
      )}
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" size={20} />
          <p>{toast}</p>
          <button aria-label="Fermer la notification" onClick={() => setToast("")}>
            <Icon name="close" size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
