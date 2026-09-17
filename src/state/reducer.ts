import {
  addEntry,
  clearFinalCount,
  editEntry,
  removeEntry,
  setFinalCount,
} from '../domain/ledger';
import type { LedgerEntryKind, Player, Session } from '../domain/types';
import type { AppState } from '../storage/store';

export type Action =
  | { type: 'ADD_PLAYER'; player: Player }
  | { type: 'RENAME_PLAYER'; playerId: string; name: string }
  | { type: 'SET_PLAYER_ICON'; playerId: string; icon: string }
  | { type: 'START_SESSION'; session: Session }
  | { type: 'ADD_LATECOMER'; sessionId: string; playerId: string }
  | {
      type: 'ADD_ENTRY';
      sessionId: string;
      entry: { playerId: string; kind: LedgerEntryKind; amountCents: number; at: number };
    }
  | { type: 'REMOVE_ENTRY'; sessionId: string; entryId: string }
  | { type: 'EDIT_ENTRY'; sessionId: string; entryId: string; amountCents: number }
  | { type: 'SET_FINAL_COUNT'; sessionId: string; playerId: string; amountCents: number }
  | { type: 'CLEAR_FINAL_COUNT'; sessionId: string; playerId: string }
  | { type: 'ENTER_COUNTING'; sessionId: string }
  | { type: 'BACK_TO_SESSION'; sessionId: string }
  | { type: 'FINISH_SETTLEMENT'; sessionId: string; endedAt: number }
  | { type: 'UPDATE_SETTINGS'; currency: string };

function updateSession(state: AppState, sessionId: string, fn: (session: Session) => Session): AppState {
  return {
    ...state,
    sessions: state.sessions.map((session) => (session.id === sessionId ? fn(session) : session)),
  };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_PLAYER':
      return { ...state, players: [...state.players, action.player] };

    case 'RENAME_PLAYER':
      return {
        ...state,
        players: state.players.map((player) =>
          player.id === action.playerId ? { ...player, name: action.name } : player,
        ),
      };

    case 'SET_PLAYER_ICON':
      return {
        ...state,
        players: state.players.map((player) =>
          player.id === action.playerId ? { ...player, icon: action.icon } : player,
        ),
      };

    case 'START_SESSION':
      return { ...state, sessions: [...state.sessions, action.session], activeSessionId: action.session.id };

    case 'ADD_LATECOMER':
      return updateSession(state, action.sessionId, (session) =>
        session.playerIds.includes(action.playerId)
          ? session
          : { ...session, playerIds: [...session.playerIds, action.playerId] },
      );

    case 'ADD_ENTRY':
      return updateSession(state, action.sessionId, (session) => addEntry(session, action.entry));

    case 'REMOVE_ENTRY':
      return updateSession(state, action.sessionId, (session) => removeEntry(session, action.entryId));

    case 'EDIT_ENTRY':
      return updateSession(state, action.sessionId, (session) =>
        editEntry(session, action.entryId, { amountCents: action.amountCents }),
      );

    case 'SET_FINAL_COUNT':
      return updateSession(state, action.sessionId, (session) =>
        setFinalCount(session, action.playerId, action.amountCents),
      );

    case 'CLEAR_FINAL_COUNT':
      return updateSession(state, action.sessionId, (session) => clearFinalCount(session, action.playerId));

    case 'ENTER_COUNTING':
      return updateSession(state, action.sessionId, (session) => ({ ...session, status: 'counting' }));

    case 'BACK_TO_SESSION':
      return updateSession(state, action.sessionId, (session) => ({ ...session, status: 'active' }));

    case 'FINISH_SETTLEMENT':
      return {
        ...updateSession(state, action.sessionId, (session) => ({
          ...session,
          status: 'settled',
          endedAt: action.endedAt,
        })),
        activeSessionId: state.activeSessionId === action.sessionId ? null : state.activeSessionId,
      };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, currency: action.currency } };

    default:
      return state;
  }
}
