import { useEffect, useMemo, useState, type ReactNode, useReducer } from 'react';
import { canSettle } from '../domain/ledger';
import type { Session } from '../domain/types';
import { loadState, saveState, type AppState } from '../storage/store';
import { reducer, type Action } from './reducer';
import { AppContext } from './useApp';

export type View =
  | 'home'
  | 'session'
  | 'count'
  | 'settle'
  | 'history'
  | 'historyDetail'
  | 'settings'
  | 'runit';

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  view: View;
  historyDetailId: string | null;
  activeSession: Session | null;
  goHome: () => void;
  goToSession: () => void;
  goToCount: () => void;
  backToSessionFromCount: () => void;
  requestSettle: () => boolean;
  goToHistory: () => void;
  openHistoryDetail: (sessionId: string) => void;
  backFromHistoryDetail: () => void;
  goToSettings: () => void;
  openRunIt: () => void;
  closeRunIt: () => void;
  finishNight: (sessionId: string) => void;
}

function initialView(state: AppState): View {
  const session = state.sessions.find((s) => s.id === state.activeSessionId);
  if (!session) return 'home';
  return session.status === 'counting' ? 'count' : 'session';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [view, setView] = useState<View>(() => initialView(state));
  const [historyDetailId, setHistoryDetailId] = useState<string | null>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const activeSession = state.sessions.find((s) => s.id === state.activeSessionId) ?? null;

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      dispatch,
      view,
      historyDetailId,
      activeSession,
      goHome: () => setView('home'),
      goToSession: () => setView('session'),
      goToCount: () => {
        if (activeSession) dispatch({ type: 'ENTER_COUNTING', sessionId: activeSession.id });
        setView('count');
      },
      backToSessionFromCount: () => {
        if (activeSession) dispatch({ type: 'BACK_TO_SESSION', sessionId: activeSession.id });
        setView('session');
      },
      requestSettle: () => {
        if (!activeSession || !canSettle(activeSession)) return false;
        setView('settle');
        return true;
      },
      goToHistory: () => setView('history'),
      openHistoryDetail: (sessionId: string) => {
        setHistoryDetailId(sessionId);
        setView('historyDetail');
      },
      backFromHistoryDetail: () => {
        setHistoryDetailId(null);
        setView('history');
      },
      goToSettings: () => setView('settings'),
      openRunIt: () => setView('runit'),
      closeRunIt: () => setView('session'),
      finishNight: (sessionId: string) => {
        dispatch({ type: 'FINISH_SETTLEMENT', sessionId, endedAt: Date.now() });
        setView('home');
      },
    }),
    [state, view, historyDetailId, activeSession],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
