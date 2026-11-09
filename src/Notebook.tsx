import { Fragment, useEffect, useLayoutEffect, useRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { Button, Icon, Mark, helpTexts } from "./App";
import type { Draft, Message } from "./App";
import "./Notebook.css";

function GrowingTextarea({ value, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const textarea = ref.current;
    if (!textarea) return;
    const grow = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(120, textarea.scrollHeight)}px`;
    };
    grow();
    let width = textarea.getBoundingClientRect().width;
    const observer = new ResizeObserver(() => {
      const nextWidth = textarea.getBoundingClientRect().width;
      if (width !== nextWidth) {
        width = nextWidth;
        grow();
      }
    });
    observer.observe(textarea);
    return () => observer.disconnect();
  }, [value]);
  return <textarea {...props} ref={ref} value={value} rows={3} className="chat-input" />;
}

function ChatAvatar({ student = false }: { student?: boolean }) {
  return (
    <span
      className={`chat-avatar ${student ? "student" : "assistant"}`}
      role="img"
      aria-label={student ? "Étudiant" : "ThinkFirst"}
    >
      {student ? <Icon name="user" size={21} /> : <Mark small />}
    </span>
  );
}

export default function Notebook({
  draft,
  busy,
  error,
  clarify,
  pending,
  simulateError,
  onDraft,
  onEditDraft,
  onPrecisionDraft,
  onSend,
  onEdit,
  onRespond,
  onRetry,
  onClarify,
  onCheck,
  onSimulateError,
}: {
  draft: Draft;
  busy: boolean;
  error: boolean;
  clarify: boolean;
  pending: Message | null;
  simulateError: boolean;
  onDraft: (value: string) => void;
  onEditDraft: (value: Draft["editDraft"]) => void;
  onPrecisionDraft: (value: string) => void;
  onSend: () => void;
  onEdit: (index: number, text: string) => void;
  onRespond: (message: Message) => void;
  onRetry: () => void;
  onClarify: (value: boolean) => void;
  onCheck: () => void;
  onSimulateError: (value: boolean) => void;
}) {
  const editing = draft.editDraft;
  const first = !draft.turns.length;
  const value = editing
    ? editing.text
    : clarify
      ? draft.precisionDraft
      : first
        ? draft.attempt
        : draft.nextAttempt;
  const composer = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (busy || error)
      status.current?.scrollIntoView({
        block: "nearest",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }, [busy, error]);
  function focusComposer() {
    setTimeout(() => composer.current?.querySelector("textarea")?.focus(), 0);
  }
  function requestHelp(kind: string) {
    onRespond({
      kind,
      text: helpTexts[kind],
      studentText:
        kind === "Pour commencer"
          ? "J’ai besoin d’une première piste."
          : kind === "Plus simple"
            ? "Peux-tu expliquer plus simplement ?"
            : kind,
    });
  }
  function studentMessage(text: string, index?: number) {
    return (
      <article className="chat-row student" aria-label="Message de l’étudiant">
        <div className="chat-message-content">
          <div className="chat-bubble">
            <p>{text}</p>
          </div>
          {index !== undefined && (
            <button
              className="chat-modify"
              disabled={busy || error}
              onClick={() => {
                onEditDraft({ index, text });
                focusComposer();
              }}
              aria-label={`Modifier mon message ${index + 1}`}
            >
              Modifier
            </button>
          )}
        </div>
        <ChatAvatar student />
      </article>
    );
  }
  function helpActions() {
    return (
      <div className="chat-message-actions">
        <div className="chat-help-buttons" aria-label="Demander une aide">
          {(["Un indice", "Un exemple", "Expliquer la notion"] as const).map((label, i) => (
            <Button
              key={label}
              variant="secondary"
              disabled={busy || error || !!editing}
              onClick={() => requestHelp(label)}
            >
              <Icon name={i === 0 ? "bulb" : i === 1 ? "code" : "book"} size={18} />
              {label}
            </Button>
          ))}
        </div>
        <div className="chat-further-actions">
          <button disabled={busy || error || !!editing} onClick={() => requestHelp("Plus simple")}>
            Plus simple
          </button>
          <button disabled={busy || error || !!editing} onClick={() => requestHelp("Approfondir")}>
            Approfondir
          </button>
          <button
            disabled={busy || error || !!editing}
            onClick={() => {
              onClarify(!clarify);
              focusComposer();
            }}
          >
            Préciser ma demande
          </button>
        </div>
      </div>
    );
  }
  function assistantMessage(message: Message, last: boolean, key: string) {
    return (
      <Fragment key={key}>
        {message.kind !== "Retour sur ta tentative" &&
          studentMessage(message.studentText || message.kind)}
        <article className="chat-row assistant" aria-label="Message de ThinkFirst">
          <ChatAvatar />
          <div className="chat-message-content">
            <div className="chat-bubble">
              <p>{message.text}</p>
            </div>
            {last && helpActions()}
          </div>
        </article>
      </Fragment>
    );
  }
  const lastTurn = draft.turns.length - 1;
  return (
    <section className="conversation-page" aria-label="Conversation pédagogique">
      <details className="chat-exercise" open>
        <summary>
          <span>
            <Icon name="book" size={20} />
            Mon exercice
          </span>
          <Icon name="chevron" size={18} />
        </summary>
        <p>{draft.exercise}</p>
      </details>
      <div
        className="chat-thread"
        role="log"
        aria-label="Historique de la conversation"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {!draft.turns.length && !draft.openingMessages.length && (
          <article className="chat-row assistant" aria-label="Message de ThinkFirst">
            <ChatAvatar />
            <div className="chat-message-content">
              <div className="chat-bubble">
                <p>
                  Quelle serait ta première idée ? Une tentative incomplète suffit pour commencer.
                </p>
              </div>
            </div>
          </article>
        )}
        {draft.openingMessages.map((message, i) =>
          assistantMessage(
            message,
            first && i === draft.openingMessages.length - 1,
            `opening-${i}`,
          ),
        )}
        {draft.turns.map((turn, index) => (
          <Fragment key={`turn-${index}`}>
            {studentMessage(turn.text, index)}
            {turn.messages.map((message, i) =>
              assistantMessage(
                message,
                index === lastTurn && i === turn.messages.length - 1,
                `message-${index}-${i}`,
              ),
            )}
          </Fragment>
        ))}
      </div>
      <div className="chat-status" ref={status} aria-live="polite">
        {busy && (
          <div className="chat-row assistant">
            <ChatAvatar />
            <div className="chat-loading" role="status">
              <span className="loading-dots">
                <i />
                <i />
                <i />
              </span>
              Préparation de la réponse…
            </div>
          </div>
        )}
        {error && (
          <div className="error-message" role="alert">
            <strong>La réponse n’a pas pu être préparée.</strong>
            <p>Ton message est conservé. Tu peux réessayer.</p>
            <Button variant="secondary" disabled={!pending} onClick={onRetry}>
              <Icon name="refresh" size={18} />
              Réessayer
            </Button>
          </div>
        )}
      </div>
      <div className="chat-composer" ref={composer}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (busy || error || !value.trim()) return;
            if (editing) {
              onEdit(editing.index, value.trim());
              onEditDraft(null);
            } else if (clarify) {
              onRespond({
                kind: "Reprenons ensemble",
                studentText: value.trim(),
                text: `Merci pour cette précision. La moyenne est la somme divisée par le nombre de valeurs. En Python, on peut utiliser sum(nombres) / len(nombres). Reprenons à partir de cette méthode.`,
              });
              onClarify(false);
              onPrecisionDraft("");
            } else onSend();
            focusComposer();
          }}
        >
          <label htmlFor="chat-response">
            {editing
              ? "Modifier ton message"
              : clarify
                ? "Que souhaites-tu préciser ?"
                : "Ta réponse"}
          </label>
          <GrowingTextarea
            id="chat-response"
            required
            value={value}
            placeholder={
              first ? "Je pense que je pourrais commencer par…" : "Écris ton idée ou ta question…"
            }
            onChange={(e) =>
              editing
                ? onEditDraft({ ...editing, text: e.target.value })
                : clarify
                  ? onPrecisionDraft(e.target.value)
                  : onDraft(e.target.value)
            }
          />
          <div className="chat-composer-actions">
            {editing ? (
              <Button type="button" variant="text" onClick={() => onEditDraft(null)}>
                Annuler la modification
              </Button>
            ) : clarify ? (
              <Button type="button" variant="text" onClick={() => onClarify(false)}>
                Revenir à ma réponse
              </Button>
            ) : first ? (
              <Button
                type="button"
                variant="text"
                disabled={busy || error}
                onClick={() => requestHelp("Pour commencer")}
              >
                <Icon name="bulb" size={18} />
                Une première piste
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={busy || error || !value.trim()}>
              {editing ? "Valider la modification" : "Envoyer"}
              <Icon name="send" size={18} />
            </Button>
          </div>
        </form>
      </div>
      {draft.turns.length > 0 && !editing && !busy && !error && (
        <section className="chat-ready">
          <div>
            <h2>Prêt à essayer sans aide ?</h2>
            <p>Mets ta démarche à l’épreuve avec un nouvel exemple.</p>
          </div>
          <Button variant="secondary" onClick={onCheck}>
            Vérifier ma compréhension <Icon name="arrow" size={18} />
          </Button>
        </section>
      )}
      <details className="prototype-tools chat-tools">
        <summary>Options du prototype</summary>
        <label>
          <input
            type="checkbox"
            checked={simulateError}
            onChange={(e) => onSimulateError(e.target.checked)}
          />
          Simuler une erreur à la prochaine réponse
        </label>
        <p>
          Les réponses sont simulées. Les séances sont enregistrées uniquement dans ce navigateur.
        </p>
      </details>
    </section>
  );
}
