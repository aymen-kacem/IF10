import type { Draft } from "./App";

export type SavedSession = { id: string; updatedAt: string; data: Draft };
export type SessionLibrary = { activeId: string; sessions: SavedSession[] };
export const storageKey = "thinkfirst-sessions";

export function loadSessions(initial: Draft): SessionLibrary {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const library = JSON.parse(stored) as SessionLibrary;
      if (Array.isArray(library.sessions) && library.sessions.length) {
        const sessions = library.sessions.filter(
          (s) => s.id && s.data && Array.isArray(s.data.turns),
        );
        if (sessions.length)
          return {
            activeId: sessions.some((s) => s.id === library.activeId)
              ? library.activeId
              : sessions[0].id,
            sessions: sessions.map((s) => ({ ...s, data: { ...initial, ...s.data } })),
          };
      }
    }
  } catch {
    /* A session still works when browser storage is unavailable. */
  }
  let data = initial;
  try {
    const previous = sessionStorage.getItem("thinkfirst-draft");
    if (previous) {
      const restored = JSON.parse(previous);
      data = { ...initial, ...restored };
      if (!restored.turns) {
        data.turns = data.sent > 0 ? [{ text: data.attempt, messages: data.messages }] : [];
        data.openingMessages = data.sent > 0 ? [] : data.messages;
      }
    }
  } catch {
    /* Retain the example when an earlier session cannot be read. */
  }
  const id = crypto.randomUUID();
  return { activeId: id, sessions: [{ id, updatedAt: new Date().toISOString(), data }] };
}
