import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
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
        : kind === "Plus simple"
          ? "Peux-tu m'expliquer plus simplement ?"
          : kind === "Approfondir"
            ? "Comment aller plus loin sur cette notion ?"
            : `Peux-tu me donner ${kind.toLowerCase()} ?`;

    onRespond({
      kind,
      text: helpTexts[kind] || "Regardons cela ensemble pas à pas.",
      studentText,
    });
  }

  const hasMessages = draft.turns.length > 0 || draft.openingMessages.length > 0;

  return (
    <section className="chat-interface" aria-label="Conversation avec ThinkFirst">
      {/* Exercise context card at the top */}
      <div className="chat-exercise-card">
        <button
          type="button"
          className="chat-exercise-toggle"
          onClick={() => setExerciseOpen(!exerciseOpen)}
          aria-expanded={exerciseOpen}
        >
          <div className="chat-exercise-badge">
            <Icon name="book" size={17} />
            <span>Énoncé de l’exercice</span>
            <span className="chat-exercise-subject">{draft.subject}</span>
          </div>
          <span className={`chat-exercise-chevron ${exerciseOpen ? "open" : ""}`}>
            <Icon name="chevron" size={17} />
          </span>
        </button>
        {exerciseOpen && (
          <div className="chat-exercise-body">
            <p>{draft.exercise}</p>
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
                    Bonjour ! Je suis ThinkFirst. Quelle est ta première idée pour aborder cet exercice ? Même une intuition incomplète suffit pour démarrer ensemble !
                  </p>
                </div>
                {/* Pedagogical suggestion chips */}
                <div className="chat-chips-row">
                  <button
                    type="button"
                    className="chat-chip"
                    onClick={() => requestHelp("Pour commencer")}
                    disabled={busy}
                  >
                    <Icon name="bulb" size={15} />
                    <span>Une première piste</span>
                  </button>
                  <button
                    type="button"
                    className="chat-chip"
                    onClick={() => requestHelp("Un exemple")}
                    disabled={busy}
                  >
                    <Icon name="code" size={15} />
                    <span>Voir un exemple</span>
                  </button>
                  <button
                    type="button"
                    className="chat-chip"
                    onClick={() => requestHelp("Expliquer la notion")}
                    disabled={busy}
                  >
                    <Icon name="book" size={15} />
                    <span>Expliquer la notion</span>
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
                    <p>{msg.studentText}</p>
                  </div>
                </div>
                <ChatAvatar student />
              </div>
            )}
            <div className="chat-row assistant">
              <ChatAvatar />
              <div className="chat-bubble-wrapper">
                <div className="chat-bubble assistant-bubble">
                  <p>{msg.text}</p>
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
                    <p>{turn.text}</p>
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
                            <p>{msg.studentText}</p>
                          </div>
                        </div>
                        <ChatAvatar student />
                      </div>
                    )}
                    <div className="chat-row assistant">
                      <ChatAvatar />
                      <div className="chat-bubble-wrapper">
                        <div className="chat-bubble assistant-bubble">
                          <p>{msg.text}</p>
                        </div>

                        {/* Pedagogical quick action pills for the latest response */}
                        {isLatestMsg && !busy && (
                          <div className="chat-chips-row">
                            <button
                              type="button"
                              className="chat-chip"
                              onClick={() => requestHelp("Un indice")}
                            >
                              <Icon name="bulb" size={15} />
                              <span>Un indice</span>
                            </button>
                            <button
                              type="button"
                              className="chat-chip"
                              onClick={() => requestHelp("Un exemple")}
                            >
                              <Icon name="code" size={15} />
                              <span>Un exemple</span>
                            </button>
                            <button
                              type="button"
                              className="chat-chip"
                              onClick={() => requestHelp("Expliquer la notion")}
                            >
                              <Icon name="book" size={15} />
                              <span>Expliquer la notion</span>
                            </button>
                            <button
                              type="button"
                              className="chat-chip sub-chip"
                              onClick={() => requestHelp("Plus simple")}
                            >
                              <span>Plus simple</span>
                            </button>
                            <button
                              type="button"
                              className="chat-chip sub-chip"
                              onClick={() => requestHelp("Approfondir")}
                            >
                              <span>Approfondir</span>
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
              <div className="typing-dots" aria-label="ThinkFirst est en train de réfléchir...">
                <span />
                <span />
                <span />
              </div>
              <span className="typing-label">ThinkFirst réfléchit...</span>
            </div>
          </div>
        )}

        {/* Error notification if any */}
        {error && (
          <div className="chat-error-card" role="alert">
            <p>Une petite pause technique est survenue. Ton message est conservé.</p>
            <Button variant="secondary" onClick={onRetry}>
              <Icon name="refresh" size={16} /> Réessayer
            </Button>
          </div>
        )}

        {/* Card to advance to Bilan when the student has exchanged ideas */}
        {draft.turns.length > 0 && !busy && (
          <div className="chat-advance-card">
            <div className="chat-advance-info">
              <span className="chat-advance-badge">
                <Icon name="check" size={15} /> Étape de réflexion accomplie
              </span>
              <h3>Prêt à faire le point sur ta compréhension ?</h3>
              <p>Passe à l'étape du bilan pour synthétiser tes découvertes et valider ta démarche.</p>
            </div>
            <Button onClick={onGoToSummary} className="chat-advance-btn">
              Passer au bilan <Icon name="arrow" size={17} />
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ChatGPT-style bottom composer */}
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
                  ? "Écris ta première intuition ou ta réponse... (Entrée pour envoyer)"
                  : "Écris ta réflexion, ton calcul ou ta question... (Entrée pour envoyer)"
              }
              aria-label="Ton message ou réflexion"
              disabled={busy}
            />
            <button
              type="submit"
              className={`chat-send-btn ${value.trim() && !busy ? "active" : ""}`}
              disabled={!value.trim() || busy}
              aria-label="Envoyer le message"
              title="Envoyer (Entrée)"
            >
              <Icon name="send" size={17} />
            </button>
          </div>
        </form>
        <p className="chat-composer-footnote">
          ThinkFirst t’aide à construire ton propre raisonnement, étape par étape.
        </p>
      </div>
    </section>
  );
}
