import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Button, Icon, Mark, helpTexts } from "./App";
import type { Draft, Message } from "./App";
import "./Notebook.css";

function ChatAvatar({ student = false }: { student?: boolean }) {
  return (
    <div
      className={`chat-avatar ${student ? "student" : "assistant"}`}
      aria-label={student ? "Logo Étudiant" : "Logo ThinkFirst"}
      title={student ? "Étudiant" : "ThinkFirst"}
    >
      {student ? <Icon name="user" size={19} /> : <Mark small />}
    </div>
  );
}

// Formats message content with code blocks and inline code highlighting
function FormattedMessage({ text }: { text: string }) {
  if (!text) return null;

  // Split by code fences ```
  const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(renderInline(text.substring(lastIndex, match.index), `text-${lastIndex}`));
    }
    const lang = match[1] || "python";
    const code = match[2];
    parts.push(
      <div key={`code-${match.index}`} className="code-snippet-box">
        <div className="code-snippet-header">
          <span className="code-lang-tag">{lang}</span>
          <span className="code-dot-group">
            <span />
            <span />
            <span />
          </span>
        </div>
        <pre className="code-snippet-body">
          <code>{code}</code>
        </pre>
      </div>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(renderInline(text.substring(lastIndex), `text-${lastIndex}`));
  }

  return <div className="formatted-message">{parts}</div>;
}

function renderInline(content: string, keyPrefix: string): ReactNode {
  const lines = content.split("\n");
  return (
    <div key={keyPrefix} className="text-paragraphs">
      {lines.map((line, lIdx) => {
        if (!line.trim()) return <div key={`empty-${lIdx}`} className="para-spacer" />;

        // Parse inline code `...`
        const inlineParts: ReactNode[] = [];
        const inlineRegex = /`([^`]+)`/g;
        let lastInlineIdx = 0;
        let inlineMatch: RegExpExecArray | null;

        while ((inlineMatch = inlineRegex.exec(line)) !== null) {
          if (inlineMatch.index > lastInlineIdx) {
            inlineParts.push(line.substring(lastInlineIdx, inlineMatch.index));
          }
          inlineParts.push(
            <code key={`inline-${lIdx}-${inlineMatch.index}`} className="inline-code">
              {inlineMatch[1]}
            </code>,
          );
          lastInlineIdx = inlineMatch.index + inlineMatch[0].length;
        }

        if (lastInlineIdx < line.length) {
          inlineParts.push(line.substring(lastInlineIdx));
        }

        return (
          <p key={`line-${lIdx}`} className="chat-paragraph">
            {inlineParts}
          </p>
        );
      })}
    </div>
  );
}

export default function Notebook({
  draft,
  busy,
  error,
  pending,
  onDraft,
  onSend,
  onRespond,
  onRetry,
  onGoToSummary,
}: {
  draft: Draft;
  busy: boolean;
  error: boolean;
  pending: Message | null;
  onDraft: (value: string) => void;
  onSend: (customText?: string) => void;
  onRespond: (message: Message) => void;
  onRetry: () => void;
  onGoToSummary: () => void;
}) {
  const [exerciseOpen, setExerciseOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const value = draft.turns.length ? draft.nextAttempt : draft.attempt;

  // Auto-scroll to bottom whenever messages or busy state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [draft.turns, draft.openingMessages, busy, pending]);

  // Auto resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [value]);

  function handleSend() {
    if (busy || error || !value.trim()) return;
    onSend();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function requestHelp(kind: string) {
    if (busy || error) return;
    const studentText =
      kind === "Pour commencer"
        ? "J’ai besoin d’une première piste pour démarrer."
        : kind === "Trace sur un exemple"
          ? "Faisons une trace d'exécution pas à pas sur un exemple concret."
          : kind === "Cas limites (edge cases)"
            ? "Quels sont les cas limites particuliers à surveiller ?"
            : kind === "Idée en pseudo-code"
              ? "Peux-tu me donner la structure générale en pseudo-code ?"
              : kind === "Décomposer l'étape"
                ? "Comment décomposer la première sous-étape de cet algorithme ?"
                : kind === "Analyser la complexité"
                  ? "Quelle est la complexité temporelle et mémoire attendue ?"
                  : kind === "Plus simple"
                    ? "Peux-tu m'expliquer de manière plus simple ?"
                    : kind === "Approfondir"
                      ? "Comment optimiser ou aller plus loin ?"
                      : `Peux-tu me donner ${kind.toLowerCase()} ?`;

    onRespond({
      kind,
      text: helpTexts[kind] || "Regardons cet algorithme ensemble pas à pas.",
      studentText,
    });
  }

  const hasMessages = draft.turns.length > 0 || draft.openingMessages.length > 0;

  return (
    <section className="chat-interface" aria-label="Conversation algorithmique avec ThinkFirst">
      {/* Exercise context card at the top */}
      <div className="chat-exercise-card">
        <button
          type="button"
          className="chat-exercise-toggle"
          onClick={() => setExerciseOpen(!exerciseOpen)}
          aria-expanded={exerciseOpen}
        >
          <div className="chat-exercise-badge">
            <Icon name="code" size={17} />
            <span>Algorithme : {draft.subject}</span>
            <span className="chat-exercise-lang">{draft.language || "Python"}</span>
            {draft.category && <span className="chat-exercise-cat">{draft.category}</span>}
          </div>
          <span className={`chat-exercise-chevron ${exerciseOpen ? "open" : ""}`}>
            <Icon name="chevron" size={17} />
          </span>
        </button>

        {exerciseOpen && (
          <div className="chat-exercise-body">
            <p className="exercise-desc">{draft.exercise}</p>
            {draft.functionSignature && (
              <div className="exercise-meta-box">
                <span className="meta-label">Signature de fonction :</span>
                <code className="meta-code">{draft.functionSignature}</code>
              </div>
            )}
            {draft.testCases && (
              <div className="exercise-meta-box">
                <span className="meta-label">Tests de validation :</span>
                <code className="meta-code">{draft.testCases}</code>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main chat messages container */}
      <div className="chat-messages-container" role="log" aria-live="polite">
        {/* Welcome message from ThinkFirst if chat is new */}
        {!hasMessages && (
          <div className="chat-turn assistant-turn">
            <div className="chat-row assistant">
              <ChatAvatar />
              <div className="chat-bubble-wrapper">
                <div className="chat-bubble assistant-bubble">
                  <p>
                    Bonjour ! Je suis ThinkFirst. Comment abordes-tu cet algorithme ?
                  </p>
                  <p>
                    Identifie d'abord les entrées, la sortie attendue ou une première variable dont tu auras besoin. Même une idée partielle suffit pour démarrer !
                  </p>
                </div>

                {/* Algorithmic quick action chips */}
                <div className="chat-chips-row">
                  <button
                    type="button"
                    className="chat-chip"
                    onClick={() => requestHelp("Trace sur un exemple")}
                    disabled={busy}
                  >
                    <Icon name="bulb" size={14} />
                    <span>Trace sur un exemple</span>
                  </button>
                  <button
                    type="button"
                    className="chat-chip"
                    onClick={() => requestHelp("Cas limites (edge cases)")}
                    disabled={busy}
                  >
                    <Icon name="code" size={14} />
                    <span>Cas limites (edge cases)</span>
                  </button>
                  <button
                    type="button"
                    className="chat-chip"
                    onClick={() => requestHelp("Idée en pseudo-code")}
                    disabled={busy}
                  >
                    <Icon name="book" size={14} />
                    <span>Idée en pseudo-code</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Opening messages if any */}
        {draft.openingMessages.map((msg, i) => (
          <div key={`opening-${i}`} className="chat-turn assistant-turn">
            {msg.studentText && (
              <div className="chat-row student">
                <div className="chat-bubble-wrapper">
                  <div className="chat-bubble student-bubble">
                    <FormattedMessage text={msg.studentText} />
                  </div>
                </div>
                <ChatAvatar student />
              </div>
            )}
            <div className="chat-row assistant">
              <ChatAvatar />
              <div className="chat-bubble-wrapper">
                <div className="chat-bubble assistant-bubble">
                  <FormattedMessage text={msg.text} />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Conversational turns */}
        {draft.turns.map((turn, tIdx) => {
          const isLatestTurn = tIdx === draft.turns.length - 1;
          return (
            <div key={`turn-${tIdx}`} className="chat-turn">
              {/* Student message on the RIGHT */}
              <div className="chat-row student">
                <div className="chat-bubble-wrapper">
                  <div className="chat-bubble student-bubble">
                    <FormattedMessage text={turn.text} />
                  </div>
                </div>
                <ChatAvatar student />
              </div>

              {/* ThinkFirst responses on the LEFT */}
              {turn.messages.map((msg, mIdx) => {
                const isLatestMsg = isLatestTurn && mIdx === turn.messages.length - 1;
                return (
                  <div key={`msg-${tIdx}-${mIdx}`} className="assistant-message-group">
                    {msg.studentText && msg.kind !== "Retour sur ta tentative" && (
                      <div className="chat-row student sub-prompt">
                        <div className="chat-bubble-wrapper">
                          <div className="chat-bubble student-bubble">
                            <FormattedMessage text={msg.studentText} />
                          </div>
                        </div>
                        <ChatAvatar student />
                      </div>
                    )}
                    <div className="chat-row assistant">
                      <ChatAvatar />
                      <div className="chat-bubble-wrapper">
                        <div className="chat-bubble assistant-bubble">
                          <FormattedMessage text={msg.text} />
                        </div>

                        {/* Algorithmic action chips for the latest response */}
                        {isLatestMsg && !busy && (
                          <div className="chat-chips-row">
                            <button
                              type="button"
                              className="chat-chip"
                              onClick={() => requestHelp("Trace sur un exemple")}
                            >
                              <Icon name="bulb" size={14} />
                              <span>Trace sur un exemple</span>
                            </button>
                            <button
                              type="button"
                              className="chat-chip"
                              onClick={() => requestHelp("Cas limites (edge cases)")}
                            >
                              <Icon name="code" size={14} />
                              <span>Cas limites</span>
                            </button>
                            <button
                              type="button"
                              className="chat-chip"
                              onClick={() => requestHelp("Idée en pseudo-code")}
                            >
                              <Icon name="book" size={14} />
                              <span>Pseudo-code</span>
                            </button>
                            <button
                              type="button"
                              className="chat-chip sub-chip"
                              onClick={() => requestHelp("Décomposer l'étape")}
                            >
                              <span>Décomposer</span>
                            </button>
                            <button
                              type="button"
                              className="chat-chip sub-chip"
                              onClick={() => requestHelp("Analyser la complexité")}
                            >
                              <span>Complexité O(n)</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Typing indicator when ThinkFirst is replying */}
        {busy && (
          <div className="chat-row assistant chat-typing-row">
            <ChatAvatar />
            <div className="chat-bubble assistant-bubble typing-bubble">
              <div className="typing-dots" aria-label="ThinkFirst analyse l'algorithme...">
                <span />
                <span />
                <span />
              </div>
              <span className="typing-label">ThinkFirst analyse ton raisonnement...</span>
            </div>
          </div>
        )}

        {/* Error notification if any */}
        {error && (
          <div className="chat-error-card" role="alert">
            <p>Une petite pause technique est survenue. Ton raisonnement est conservé.</p>
            <Button variant="secondary" onClick={onRetry}>
              <Icon name="refresh" size={16} /> Réessayer
            </Button>
          </div>
        )}

        {/* Card to advance to Bilan & Complexity */}
        {draft.turns.length > 0 && !busy && (
          <div className="chat-advance-card">
            <div className="chat-advance-info">
              <span className="chat-advance-badge">
                <Icon name="check" size={15} /> Logique algorithmique identifiée
              </span>
              <h3>Prêt à formaliser le code et analyser la complexité ?</h3>
              <p>
                Passe à l'étape du bilan pour synthétiser le patron d'algorithme, vérifier les cas
                limites et la complexité temporelle/mémoire.
              </p>
            </div>
            <Button onClick={onGoToSummary} className="chat-advance-btn">
              Passer au bilan & complexité <Icon name="arrow" size={17} />
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ChatGPT-style bottom composer with code/text prompt */}
      <div className="chat-composer-section">
        <form
          className="chat-composer-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <div className="chat-composer-box">
            <textarea
              ref={textareaRef}
              rows={1}
              value={value}
              onChange={(e) => onDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                draft.turns.length === 0
                  ? "Ex: Je commence par créer total = 0 et parcourir la liste... (Entrée pour envoyer)"
                  : "Écris ta réflexion, ton pseudo-code ou une variable... (Entrée pour envoyer)"
              }
              aria-label="Ta réflexion algorithmique ou code"
              disabled={busy}
            />
            <button
              type="submit"
              className={`chat-send-btn ${value.trim() && !busy ? "active" : ""}`}
              disabled={!value.trim() || busy}
              aria-label="Envoyer le message"
              title="Envoyer (Entrée, Maj+Entrée pour nouvelle ligne)"
            >
              <Icon name="send" size={17} />
            </button>
          </div>
        </form>
        <p className="chat-composer-footnote">
          ThinkFirst t’aide à construire ta pensée algorithmique sans te donner le code tout fait.
        </p>
      </div>
    </section>
  );
}
