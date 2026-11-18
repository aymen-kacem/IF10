import { useEffect, useRef, useState } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import Notebook from "./Notebook";
import { loadSessions, storageKey } from "./sessionStorage";
import type { SavedSession } from "./sessionStorage";

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

export type StepPage = "problem" | "work" | "summary";
export type Page = "home" | "sessions" | StepPage;
export type Message = { kind: string; text: string; studentText?: string };

export type AlgorithmTemplate = {
  id: string;
  title: string;
  subject: string;
  category: string;
  language: string;
  exercise: string;
  functionSignature: string;
  testCases: string;
  expectedComplexity: string;
  solutionPattern: string;
  initialCodeSnippet: string;
};

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
  language?: string;
  category?: string;
  functionSignature?: string;
  testCases?: string;
  expectedComplexity?: string;
  solutionPattern?: string;
  finalCode?: string;
};

export const algorithmTemplates: AlgorithmTemplate[] = [
  {
    id: "moyenne",
    title: "Calcul de moyenne",
    subject: "Moyenne d'une liste",
    category: "Boucles & Accumulateurs",
    language: "Python",
    exercise:
      "Écrire une fonction qui calcule la moyenne arithmétique d’une liste non vide de nombres sans utiliser de bibliothèque externe.",
    functionSignature: "def moyenne(nombres: list[float]) -> float:",
    testCases: "moyenne([10, 20]) == 15.0 | moyenne([5, 15, 10]) == 10.0",
    expectedComplexity: "Temps O(n) | Mémoire O(1)",
    solutionPattern: "Accumulateur (Somme cumulée puis division par len)",
    initialCodeSnippet:
      "def moyenne(nombres: list[float]) -> float:\n    if not nombres:\n        raise ValueError('La liste ne doit pas être vide')\n    \n    total = 0.0\n    for x in nombres:\n        total += x\n        \n    return total / len(nombres)",
  },
  {
    id: "max",
    title: "Recherche du maximum",
    subject: "Maximum d'une liste",
    category: "Parcours & Conditions",
    language: "Python",
    exercise:
      "Écrire une fonction qui retourne la valeur maximale contenue dans une liste non vide d'entiers en initialisant un candidat.",
    functionSignature: "def trouver_max(valeurs: list[int]) -> int:",
    testCases: "trouver_max([4, 12, 8, 3]) == 12 | trouver_max([-5, -2, -9]) == -2",
    expectedComplexity: "Temps O(n) | Mémoire O(1)",
    solutionPattern: "Candidat initialisé à valeurs[0] puis mise à jour conditionnelle",
    initialCodeSnippet:
      "def trouver_max(valeurs: list[int]) -> int:\n    if not valeurs:\n        raise ValueError('Liste vide')\n        \n    max_val = valeurs[0]\n    for x in valeurs[1:]:\n        if x > max_val:\n            max_val = x\n            \n    return max_val",
  },
  {
    id: "palindrome",
    title: "Vérifier un palindrome",
    subject: "Test de palindrome",
    category: "Chaînes de caractères",
    language: "Python",
    exercise:
      "Écrire une fonction qui vérifie si une chaîne de caractères se lit de la même façon dans les deux sens (ex: 'radar', 'kayak').",
    functionSignature: "def est_palindrome(mot: str) -> bool:",
    testCases: "est_palindrome('radar') == True | est_palindrome('algo') == False",
    expectedComplexity: "Temps O(n) | Mémoire O(1)",
    solutionPattern: "Technique des deux pointeurs opposés (gauche et droite)",
    initialCodeSnippet:
      "def est_palindrome(mot: str) -> bool:\n    gauche = 0\n    droite = len(mot) - 1\n    \n    while gauche < droite:\n        if mot[gauche] != mot[droite]:\n            return False\n        gauche += 1\n        droite -= 1\n        \n    return True",
  },
  {
    id: "dicho",
    title: "Recherche dichotomique",
    subject: "Recherche dichotomique",
    category: "Recherche & Tris",
    language: "Python",
    exercise:
      "Écrire un algorithme de recherche dichotomique dans une liste déjà triée pour trouver l'indice d'une valeur cible.",
    functionSignature: "def recherche_dicho(liste: list[int], cible: int) -> int:",
    testCases: "recherche_dicho([2, 5, 8, 12, 16], 12) == 3 | recherche_dicho([1, 3, 5], 4) == -1",
    expectedComplexity: "Temps O(log n) | Mémoire O(1)",
    solutionPattern: "Division de l'espace de recherche par deux à chaque itération",
    initialCodeSnippet:
      "def recherche_dicho(liste: list[int], cible: int) -> int:\n    gauche = 0\n    droite = len(liste) - 1\n    \n    while gauche <= droite:\n        milieu = (gauche + droite) // 2\n        if liste[milieu] == cible:\n            return milieu\n        elif liste[milieu] < cible:\n            gauche = milieu + 1\n        else:\n            droite = milieu - 1\n            \n    return -1",
  },
];

const defaultTemplate = algorithmTemplates[0];

const initial: Draft = {
  subject: defaultTemplate.subject,
  exercise: defaultTemplate.exercise,
  goal: "Comprendre la logique algorithmique",
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
  language: defaultTemplate.language,
  category: defaultTemplate.category,
  functionSignature: defaultTemplate.functionSignature,
  testCases: defaultTemplate.testCases,
  expectedComplexity: defaultTemplate.expectedComplexity,
  solutionPattern: defaultTemplate.solutionPattern,
  finalCode: defaultTemplate.initialCodeSnippet,
};

export const helpTexts: Record<string, string> = {
  "Trace sur un exemple":
    "Faisons tourner l'algorithme à la main (dry run) avec l'exemple d'entrée `[10, 20]` :\n\n- Au départ : `total = 0`, `compteur = 0`\n- Étape 1 : on lit 10 -> `total = 10`, `compteur = 1`\n- Étape 2 : on lit 20 -> `total = 30`, `compteur = 2`\n- Fin du parcours : la moyenne est `30 / 2 = 15.0`.\n\nQuelles variables d'état vas-tu initialiser dans ton code ?",
  "Cas limites (edge cases)":
    "En algorithmique, les cas limites (edge cases) sont cruciaux :\n\n1. Que doit renvoyer la fonction si la liste est vide `[]` ? (Risque de division par zéro `ZeroDivisionError`).\n2. Que se passe-t-il si la liste ne contient qu'un seul nombre ?\n3. L'algorithme fonctionne-t-il avec des valeurs négatives ou nulles ?\n\nComment formulerais-tu la condition de sécurité au début de la fonction ?",
  "Idée en pseudo-code":
    "Voici la structure en pseudo-code sans donner le code final :\n\n```python\nfonction moyenne(liste):\n    si liste est vide: lever une erreur\n    total = 0\n    pour chaque element dans liste:\n        total = total + element\n    retourner total / taille(liste)\n```\n\nComment traduis-tu cette boucle d'accumulation en Python ?",
  "Décomposer l'étape":
    "Décomposons le problème en 3 étapes distinctes :\n\n1. Initialisation : créer les variables d'accumulation avant la boucle (`total = 0`).\n2. Parcours itératif : mettre à jour le total à chaque élément.\n3. Calcul final : diviser le total par l'effectif (`len(nombres)`).\n\nQuelle première ligne de code souhaites-tu écrire ?",
  "Analyser la complexité":
    "Pour évaluer la complexité de cet algorithme :\n\n- **Complexité temporelle :** On parcourt les $n$ éléments une seule fois -> Temps `O(n)` (linéaire).\n- **Complexité spatiale (mémoire) :** On n'utilise que deux variables scalaires pour le cumul -> Espace `O(1)` (constant).\n\nC'est la complexité optimale car chaque élément doit être lu au moins une fois !",
  "Pour commencer":
    "Commençons par le point de départ : quelle est la première variable que tu dois créer pour accumuler les données au fur et à mesure ?",
  "Plus simple":
    "Imagine que tu dois calculer la moyenne de deux notes : 10 et 20. Tu fais d'abord la somme (30), puis tu divises par le nombre de notes (2). Ton algorithme doit faire exactement cela, mais pour n'importe quelle liste de valeurs !",
  "Approfondir":
    "En Python moderne, on peut écrire cela de manière très concise : `sum(nombres) / len(nombres)`. Comment pourrais-tu ajouter une garde `if not nombres:` pour sécuriser la fonction contre les listes vides ?",
};

export function Stepper({
  currentStep,
  onStepClick,
}: {
  currentStep: StepPage;
  onStepClick: (step: StepPage) => void;
}) {
  const steps: { id: StepPage; number: string; label: string }[] = [
    { id: "problem", number: "01", label: "Mon problème" },
    { id: "work", number: "02", label: "Raisonnement & Code" },
    { id: "summary", number: "03", label: "Bilan & Complexité" },
  ];

  const order: Record<StepPage, number> = {
    problem: 0,
    work: 1,
    summary: 2,
  };

  const currentIdx = order[currentStep];

  return (
    <nav className="stepper-banner" aria-label="Étapes de la séance d'algorithmique">
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
  const [page, setPage] = useState<Page>("home");
  const [activeSessionStep, setActiveSessionStep] = useState<StepPage>("problem");
  const [activeId, setActiveId] = useState<string>(() => crypto.randomUUID());
  const [sessions, setSessions] = useState<SavedSession[]>(() => loadSessions(initial).sessions);
  const [draft, setDraft] = useState<Draft>(() => initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState<Message | null>(null);

  // Filter state for "Mes séances" dashboard
  const [sessionFilterStatus, setSessionFilterStatus] = useState<"all" | "active" | "completed">(
    "all",
  );
  const [sessionFilterCategory, setSessionFilterCategory] = useState<string>("all");

  const titleRef = useRef<HTMLHeadingElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Silent session persistence in localStorage (no popup, no warning alert)
  useEffect(() => {
    try {
      const entry: SavedSession = {
        id: activeId,
        updatedAt: new Date().toISOString(),
        data: draft,
      };
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

  function goToSessionStep(step: StepPage) {
    setActiveSessionStep(step);
    setPage(step);
  }

  function applyTemplate(template: AlgorithmTemplate) {
    setDraft((d) => ({
      ...d,
      subject: template.subject,
      exercise: template.exercise,
      language: template.language,
      category: template.category,
      functionSignature: template.functionSignature,
      testCases: template.testCases,
      expectedComplexity: template.expectedComplexity,
      solutionPattern: template.solutionPattern,
      finalCode: template.initialCodeSnippet,
    }));
  }

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
    const isImproved = /divis|\/|somme|for |while|len\(|range|total/i.test(text);

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
        ? "Excellente intuition algorithmique ! Tu as identifié le besoin d'itérer et d'accumuler. Comment traduirais-tu cela sous forme d'une boucle Python avec une variable d'accumulation ?"
        : draft.sent > 0
          ? "La somme permet d'obtenir le total. Pour calculer la moyenne, il faut maintenant diviser ce total par le nombre d’éléments `len(nombres)`. Comment formules-tu cette étape dans ton code ?"
          : "Tu as identifié une première étape clé : parcourir les données. Quelles variables d'état vas-tu créer avant d'entrer dans la boucle ?",
    });
  }

  function newSession(template?: AlgorithmTemplate) {
    if (timer.current) clearTimeout(timer.current);
    const chosen = template || defaultTemplate;
    setActiveId(crypto.randomUUID());
    setDraft({
      ...initial,
      subject: chosen.subject,
      exercise: chosen.exercise,
      language: chosen.language,
      category: chosen.category,
      functionSignature: chosen.functionSignature,
      testCases: chosen.testCases,
      expectedComplexity: chosen.expectedComplexity,
      solutionPattern: chosen.solutionPattern,
      finalCode: chosen.initialCodeSnippet,
    });
    setBusy(false);
    setError(false);
    setPending(null);
    goToSessionStep("problem");
  }

  function resumeSession(session: SavedSession) {
    if (timer.current) clearTimeout(timer.current);
    setActiveId(session.id);
    setDraft({ ...initial, ...session.data });
    setBusy(false);
    setError(false);
    setPending(null);
    goToSessionStep(session.data.finished ? "summary" : session.data.turns.length ? "work" : "problem");
  }

  const isSessionActive = page === "problem" || page === "work" || page === "summary";

  // Filtered sessions for dashboard
  const filteredSessions = sessions.filter((s) => {
    if (sessionFilterStatus === "completed" && !s.data.finished) return false;
    if (sessionFilterStatus === "active" && s.data.finished) return false;
    if (sessionFilterCategory !== "all" && s.data.category !== sessionFilterCategory) return false;
    return true;
  });

  return (
    <div className="app">
      {/* Header with Brand and Clean Navigation */}
      <header className="header">
        <div className="header-inner">
          <button
            type="button"
            className="brand brand-btn"
            onClick={() => setPage("home")}
            aria-label="ThinkFirst, retour à l'accueil"
          >
            <Mark />
            <span>
              Think<span className="brand-light">First</span>
              <span className="brand-dot">.</span>
            </span>
            <span className="header-badge-tag">Algorithmique</span>
          </button>

          <nav aria-label="Navigation principale">
            <button
              type="button"
              className={page === "home" ? "nav-link active" : "nav-link"}
              aria-current={page === "home" ? "page" : undefined}
              onClick={() => setPage("home")}
            >
              Accueil
            </button>
            <button
              type="button"
              className={page === "sessions" ? "nav-link active" : "nav-link"}
              aria-current={page === "sessions" ? "page" : undefined}
              onClick={() => setPage("sessions")}
            >
              Mes séances
            </button>
            <button
              type="button"
              className={isSessionActive ? "nav-link active" : "nav-link"}
              aria-current={isSessionActive ? "page" : undefined}
              onClick={() => goToSessionStep(activeSessionStep)}
            >
              Résoudre un problème
            </button>
          </nav>

          <div className="header-right">
            <Button variant="secondary" onClick={() => newSession()} className="new-session-btn">
              <Icon name="plus" size={16} />
              Nouvel algorithme
            </Button>
            <span className="avatar" aria-label="Espace étudiant" title="Étudiant">
              É
            </span>
          </div>
        </div>
      </header>

      {/* PAGE 1: Accueil (Home) */}
      {page === "home" && (
        <main className="home-main">
          <div className="welcome">
            <span className="eyebrow">
              <span className="tiny-line" />
              DOMAINE INFORMATIQUE & ALGORITHMIQUE DE BASE
            </span>
            <span className="quiet-label">
              <Icon name="code" size={15} /> Penser comme un développeur, un problème à la fois.
            </span>
          </div>

          <section className="hero">
            <div className="hero-content">
              <div className="pill">
                <span />
                Mentorat algorithmique socratique
              </div>
              <h1 ref={titleRef} tabIndex={-1}>
                Sur quel algorithme
                <br /> <span>souhaites-tu réfléchir ?</span>
              </h1>
              <p>
                Construis ta logique pas à pas avec des traces d’exécution, des questions ciblées et
                l'analyse des cas limites. Sans code prémâché.
              </p>
              <Button onClick={() => goToSessionStep("problem")}>
                Résoudre un problème algorithmique <Icon name="arrow" size={19} />
              </Button>
              <div className="hero-note">
                <Icon name="check" size={15} />
                Pas besoin d’avoir déjà la syntaxe parfaite.
              </div>
            </div>

            <div
              className="hero-art"
              aria-label="De l'énoncé brut à la compréhension algorithmique"
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
                  <span className="art-label">L'INTUITION</span>
                  <strong>« Quelles sont les entrées et sorties ? »</strong>
                  <div className="art-lines">
                    <i />
                    <i />
                  </div>
                </div>
                <span className="thought-symbol">
                  <Icon name="code" size={21} />
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
                  <strong>Trace à la main & complexité O(n)</strong>
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
                Ton raisonnement construit l'algorithme.
              </div>
              <span className="art-dot dot-one" />
              <span className="art-dot dot-two" />
            </div>
          </section>

          {/* Quick Starter Classic Algorithms Section */}
          <section className="starter-algorithms-section">
            <div className="section-heading-clean">
              <div>
                <span className="eyebrow">EXERCICES CLASSIQUES</span>
                <h2>Algorithmes fondamentaux prêts à explorer</h2>
              </div>
              <p>Choisis un patron classique pour t'entraîner immédiatement :</p>
            </div>
            <div className="starter-grid">
              {algorithmTemplates.map((tmpl) => (
                <div key={tmpl.id} className="starter-card">
                  <div className="starter-card-header">
                    <span className="starter-card-tag">{tmpl.category}</span>
                    <span className="starter-card-lang">{tmpl.language}</span>
                  </div>
                  <h3>{tmpl.title}</h3>
                  <p>{tmpl.exercise}</p>
                  <div className="starter-card-footer">
                    <code className="starter-complexity">{tmpl.expectedComplexity}</code>
                    <button
                      type="button"
                      className="starter-btn"
                      onClick={() => {
                        newSession(tmpl);
                      }}
                    >
                      Démarrer <Icon name="arrow" size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Methodology */}
          <section className="approach">
            <div className="approach-heading">
              <span className="eyebrow">MÉTHODOLOGIE ALGORITHMIQUE</span>
              <h2>
                Pas de code tout fait.
                <br />
                Une démarche pour comprendre la logique.
              </h2>
              <p>Tu réfléchis à la structure. On t’accompagne vers l'implémentation.</p>
            </div>
            <div className="approach-items">
              {[
                {
                  n: "01",
                  icon: "code",
                  title: "Identifier entrées, sorties & cas limites",
                  text: "Quelles sont les données en entrée ? Quel est le type attendu ? Que faire si la liste est vide ?",
                },
                {
                  n: "02",
                  icon: "bulb",
                  title: "Faire une trace d'exécution à la main",
                  text: "Dérouler l'algorithme sur un jeu de test simple pour vérifier chaque variable d'état pas à pas.",
                },
                {
                  n: "03",
                  icon: "leaf",
                  title: "Traduire en code & évaluer la complexité",
                  text: "Formaliser les boucles, sécuriser les invariants et vérifier la complexité en temps O(n) et mémoire.",
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

          <footer className="footer">
            <span>
              <Mark small />
              ThinkFirst. Raisonner d’abord. Coder durablement.
            </span>
            <span>Accompagnement méthodologique en informatique.</span>
          </footer>
        </main>
      )}

      {/* PAGE 2: Dashboard "Mes séances" */}
      {page === "sessions" && (
        <main className="sessions-main">
          <div className="page-heading">
            <span className="eyebrow">HISTORIQUE & PROGRESSION</span>
            <h1 ref={titleRef} tabIndex={-1}>
              Mes séances d'algorithmique
            </h1>
            <p>
              Retrouve tes réflexions passées, tes traces de code et tes bilans de complexité.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{sessions.length}</span>
              <span className="stat-label">Algorithmes explorés</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {new Set(sessions.map((s) => s.data.category || "Boucles")).size}
              </span>
              <span className="stat-label">Notions fondamentales</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {sessions.filter((s) => s.data.finished).length}
              </span>
              <span className="stat-label">Bilans formalisés</span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="filter-bar">
            <div className="filter-group">
              <span className="filter-title">Statut :</span>
              <button
                type="button"
                className={`filter-pill ${sessionFilterStatus === "all" ? "active" : ""}`}
                onClick={() => setSessionFilterStatus("all")}
              >
                Tous
              </button>
              <button
                type="button"
                className={`filter-pill ${sessionFilterStatus === "active" ? "active" : ""}`}
                onClick={() => setSessionFilterStatus("active")}
              >
                En cours
              </button>
              <button
                type="button"
                className={`filter-pill ${sessionFilterStatus === "completed" ? "active" : ""}`}
                onClick={() => setSessionFilterStatus("completed")}
              >
                Terminés
              </button>
            </div>
          </div>

          {/* Sessions List */}
          <div className="session-cards-grid">
            {filteredSessions.map((session) => (
              <div key={session.id} className="session-card-item">
                <div className="session-card-top">
                  <div className="session-card-tags">
                    <span className="lang-tag">{session.data.language || "Python"}</span>
                    {session.data.category && (
                      <span className="cat-tag">{session.data.category}</span>
                    )}
                    <span className={`status-tag ${session.data.finished ? "complete" : ""}`}>
                      <span />
                      {session.data.finished ? "Validé" : "En cours"}
                    </span>
                  </div>
                  <span className="session-card-date">
                    <Icon name="clock" size={13} />
                    {new Intl.DateTimeFormat("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(session.updatedAt))}
                  </span>
                </div>
                <h3>{session.data.subject}</h3>
                <p className="session-card-desc">{session.data.exercise}</p>
                {session.data.expectedComplexity && (
                  <div className="session-card-complexity">
                    <span>Complexité :</span>
                    <code>{session.data.expectedComplexity}</code>
                  </div>
                )}
                <div className="session-card-footer">
                  <Button variant="secondary" onClick={() => resumeSession(session)}>
                    {session.data.finished ? "Consulter le bilan" : "Reprendre la séance"}{" "}
                    <Icon name="arrow" size={15} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="sessions-tip">
            <Icon name="code" size={24} />
            <p>
              Chaque algorithme résolu par toi-même ancre des réflexes de pensée essentiels pour tes
              projets et tes examens.
            </p>
            <Button variant="secondary" onClick={() => newSession()}>
              <Icon name="plus" size={16} /> Nouvel algorithme
            </Button>
          </div>
        </main>
      )}

      {/* WORKFLOW: Step 1 (Mon problème) -> Step 2 (Raisonnement) -> Step 3 (Bilan) */}
      {isSessionActive && (
        <main className="session-main">
          {/* Identical Stepper Component on Every Step */}
          <Stepper currentStep={page as StepPage} onStepClick={goToSessionStep} />

          {/* STEP 1: Mon problème algorithmique */}
          {page === "problem" && (
            <section className="form-layout" aria-label="Étape 1 : Mon problème">
              <div className="form-intro">
                <span className="section-icon">
                  <Icon name="code" size={26} />
                </span>
                <h1 ref={titleRef} tabIndex={-1}>
                  Posons le problème algorithmique.
                </h1>
                <p>
                  Choisis un langage, définis l'énoncé et la signature de fonction attendue.
                  ThinkFirst t'accompagne ensuite dans le raisonnement pas à pas.
                </p>
                <div className="soft-note">
                  <Icon name="bulb" />
                  <p>
                    Tu peux partir d’un problème type en un clic ou décrire ton propre énoncé.
                  </p>
                </div>
              </div>

              <div className="panel problem-form-wrapper">
                {/* One-click template selector */}
                <div className="template-quick-chooser">
                  <span className="chooser-label">Ou choisis un patron classique :</span>
                  <div className="template-buttons-row">
                    {algorithmTemplates.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={`template-choice-btn ${draft.subject === t.subject ? "selected" : ""}`}
                        onClick={() => applyTemplate(t)}
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>
                </div>

                <form
                  className="problem-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    goToSessionStep("work");
                  }}
                >
                  <div className="field-row-two">
                    <div className="field">
                      <label htmlFor="language">Langage cible</label>
                      <select
                        id="language"
                        value={draft.language || "Python"}
                        onChange={(e) => update("language", e.target.value)}
                      >
                        <option value="Python">Python</option>
                        <option value="Pseudo-code">Pseudo-code</option>
                        <option value="C">C</option>
                        <option value="JavaScript">JavaScript</option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="category">Catégorie algorithmique</label>
                      <input
                        id="category"
                        required
                        value={draft.category || "Boucles & Accumulateurs"}
                        onChange={(e) => update("category", e.target.value)}
                        placeholder="Ex : Boucles, Recherche, Tableaux..."
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="subject">Nom de l'algorithme ou notion</label>
                    <input
                      id="subject"
                      required
                      value={draft.subject}
                      onChange={(e) => update("subject", e.target.value)}
                      placeholder="Ex : Moyenne d'une liste, Recherche dichotomique..."
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="exercise">Énoncé du problème</label>
                    <p className="field-hint">
                      Décris ce que l'algorithme doit calculer et les conditions requises.
                    </p>
                    <textarea
                      id="exercise"
                      required
                      rows={4}
                      value={draft.exercise}
                      onChange={(e) => update("exercise", e.target.value)}
                      placeholder="Ex : Écrire une fonction qui calcule la moyenne d'une liste non vide..."
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="signature">Signature de fonction attendue</label>
                    <input
                      id="signature"
                      className="font-mono"
                      value={draft.functionSignature || ""}
                      onChange={(e) => update("functionSignature", e.target.value)}
                      placeholder="Ex: def moyenne(nombres: list[float]) -> float:"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="testCases">Jeux de tests d'exemple (Entrées / Sorties)</label>
                    <input
                      id="testCases"
                      className="font-mono"
                      value={draft.testCases || ""}
                      onChange={(e) => update("testCases", e.target.value)}
                      placeholder="Ex: moyenne([10, 20]) == 15.0"
                    />
                  </div>

                  <fieldset className="field">
                    <legend>Objectif de réflexion</legend>
                    <div className="goal-options">
                      {[
                        "Comprendre la logique algorithmique",
                        "Écrire le code pas à pas",
                        "Optimiser la complexité",
                      ].map((goal) => (
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
                      ))}
                    </div>
                  </fieldset>

                  <div className="form-bottom">
                    <span>Tu pourras adapter ces critères au cours de ta réflexion.</span>
                    <Button type="submit">
                      Commencer à réfléchir <Icon name="arrow" size={17} />
                    </Button>
                  </div>
                </form>
              </div>
            </section>
          )}

          {/* STEP 2: Raisonnement algorithmique (Dialogue interactif façon ChatGPT) */}
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
                onGoToSummary={() => goToSessionStep("summary")}
              />
            </section>
          )}

          {/* STEP 3: Bilan, Code Propre & Complexité */}
          {page === "summary" && (
            <section className="summary-layout" aria-label="Étape 3 : Bilan & Complexité">
              <div className="summary-heading">
                <span className="section-icon">
                  <Icon name="leaf" size={28} />
                </span>
                <h1 ref={titleRef} tabIndex={-1}>
                  Bilan & Complexité de l'algorithme
                </h1>
                <p>
                  Prends un moment pour ancrer le patron algorithmique découvert et formaliser le code
                  propre.
                </p>
              </div>

              {/* 3 Synthesis Cards */}
              <div className="summary-cards">
                <div className="summary-card">
                  <Icon name="code" size={22} />
                  <span className="mini-label">PATRON ALGORITHMIQUE</span>
                  <h3>{draft.solutionPattern || "Accumulateur itératif"}</h3>
                  <p>Structure générale de parcours et de traitement des données.</p>
                </div>

                <div className="summary-card">
                  <Icon name="bulb" size={22} />
                  <span className="mini-label">INVARIANTS & CAS LIMITES</span>
                  <h3>Sécurisation validée</h3>
                  <p>
                    Vérification des listes vides, gestion des indices et conditions d’arrêt
                    respectées.
                  </p>
                </div>

                <div className="summary-card">
                  <Icon name="clock" size={22} />
                  <span className="mini-label">COMPLEXITÉ ÉVALUÉE</span>
                  <h3>{draft.expectedComplexity || "Temps O(n) | Mémoire O(1)"}</h3>
                  <p>Efficacité optimale pour un parcours séquentiel des éléments.</p>
                </div>
              </div>

              {/* Code Snippet Solution Display */}
              <div className="final-code-card">
                <div className="final-code-header">
                  <div className="final-code-title">
                    <Icon name="code" size={16} />
                    <span>Implémentation propre ({draft.language || "Python"})</span>
                  </div>
                  <span className="final-code-badge">Validé</span>
                </div>
                <pre className="final-code-pre">
                  <code>{draft.finalCode || defaultTemplate.initialCodeSnippet}</code>
                </pre>
              </div>

              {/* Personal Reflection Box */}
              <div className="panel reflection-panel">
                <label htmlFor="reflection">
                  Comment expliquerais-tu cet algorithme à un camarade de promotion ?
                </label>
                <p>
                  Décris les variables utilisées, le rôle de la boucle et la formule finale avec tes
                  propres mots.
                </p>
                <textarea
                  id="reflection"
                  rows={4}
                  value={draft.reflection}
                  onChange={(e) => update("reflection", e.target.value)}
                  placeholder="Pour résoudre ce problème, on initialise un accumulateur total à zéro, puis on parcourt chaque élément avec une boucle for. Enfin, on divise la somme par la longueur len(nombres)..."
                />
                <div className="reflection-note">
                  <Icon name="leaf" size={17} />
                  Cet algorithme fait désormais partie de ta boîte à outils de développeur. Tu peux le
                  retrouver dans « Mes séances ».
                </div>
              </div>

              <div className="summary-actions">
                <button
                  type="button"
                  className="text-link subdued"
                  onClick={() => goToSessionStep("work")}
                >
                  <Icon name="back" size={16} />
                  Revenir au raisonnement
                </button>
                <Button onClick={() => newSession()}>
                  <Icon name="plus" size={17} />
                  Nouvel algorithme
                </Button>
              </div>
            </section>
          )}

          <div className="session-footnote">
            <Icon name="leaf" size={15} />
            Le bon rythme en algorithmique, c’est le tien.
          </div>
        </main>
      )}
    </div>
  );
}
