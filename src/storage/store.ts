import type { Player, Session, Settings } from '../domain/types';

export const STORAGE_KEY = 'split-da-pot:v1';
const CURRENT_VERSION = 1;

export interface AppState {
  version: 1;
  players: Player[];
  sessions: Session[];
  activeSessionId: string | null;
  settings: Settings;
}

export function defaultState(): AppState {
  return {
    version: CURRENT_VERSION,
    players: [],
    sessions: [],
    activeSessionId: null,
    settings: { currency: '€' },
  };
}

function looksLikeAppState(raw: unknown): raw is AppState {
  if (typeof raw !== 'object' || raw === null) return false;
  const candidate = raw as Record<string, unknown>;
  return (
    typeof candidate.version === 'number' &&
    Array.isArray(candidate.players) &&
    Array.isArray(candidate.sessions) &&
    (candidate.activeSessionId === null || typeof candidate.activeSessionId === 'string') &&
    typeof candidate.settings === 'object' &&
    candidate.settings !== null
  );
}

/** Version migration hook; currently identity for v1. */
export function migrate(raw: unknown): AppState {
  if (!looksLikeAppState(raw)) {
    return defaultState();
  }
  switch (raw.version) {
    case 1:
      return raw;
    default:
      return defaultState();
  }
}

export function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) {
      return defaultState();
    }
    const parsed: unknown = JSON.parse(stored);
    return migrate(parsed);
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('saveState: failed to persist state', error);
  }
}
