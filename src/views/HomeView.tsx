import { CaretLeft, ClockCounterClockwise, Gear } from '@phosphor-icons/react';
import { useState } from 'react';
import { formatCents } from '../domain/money';
import { biggestWinner } from '../domain/ledger';
import { createId } from '../domain/types';
import { IconAvatar } from '../components/IconAvatar';
import { RosterList } from '../components/RosterList';
import { useApp } from '../state/useApp';

export function HomeView() {
  const { state, dispatch, goToSession, goToHistory, goToSettings, openHistoryDetail } = useApp();
  const [picking, setPicking] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const currency = state.settings.currency;

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function startNight() {
    const session = {
      id: createId(),
      startedAt: Date.now(),
      endedAt: null,
      playerIds: [...selectedIds],
      entries: [],
      finalCounts: {},
      status: 'active' as const,
    };
    dispatch({ type: 'START_SESSION', session });
    setPicking(false);
    setSelectedIds(new Set());
    goToSession();
  }

  if (picking) {
    return (
      <div className="screen">
        <div className="screen-header">
          <div className="top-bar">
            <button type="button" className="icon-btn" aria-label="Back" onClick={() => setPicking(false)}>
              <CaretLeft size={20} />
            </button>
            <h1 className="display screen-header__title--small">Who&apos;s in tonight?</h1>
          </div>
        </div>
        <div className="screen-body">
          <RosterList mode="select" selectedIds={selectedIds} onToggle={toggle} />
        </div>
        <div className="bottom-bar">
          <button type="button" className="btn btn-primary btn-block" disabled={selectedIds.size < 2} onClick={startNight}>
            {selectedIds.size < 2 ? 'Pick at least 2 players' : `Start da night (${selectedIds.size})`}
          </button>
        </div>
      </div>
    );
  }

  const recentNights = state.sessions
    .filter((session) => session.status === 'settled')
    .sort((a, b) => (b.endedAt ?? 0) - (a.endedAt ?? 0))
    .slice(0, 3);

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="top-bar" style={{ justifyContent: 'space-between' }}>
          <h1 className="display" style={{ fontSize: 26, color: 'var(--gold)' }}>
            Split Da Pot
          </h1>
          <div style={{ display: 'flex', gap: 4 }}>
            <button type="button" className="icon-btn" aria-label="History" onClick={goToHistory}>
              <ClockCounterClockwise size={20} />
            </button>
            <button type="button" className="icon-btn" aria-label="Settings" onClick={goToSettings}>
              <Gear size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="screen-body">
        <button type="button" className="btn btn-primary btn-block" style={{ minHeight: 56, fontSize: 17 }} onClick={() => setPicking(true)}>
          Start da night
        </button>

        {recentNights.length === 0 ? (
          <div className="empty-state">
            <p>No nights played yet. Gather da crew and start one.</p>
          </div>
        ) : (
          <>
            <h2 className="dim" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 8 }}>
              Recent nights
            </h2>
            {recentNights.map((session) => {
              const winner = biggestWinner(session);
              return (
                <button
                  key={session.id}
                  type="button"
                  className="card history-row"
                  style={{ width: '100%', textAlign: 'left' }}
                  onClick={() => openHistoryDetail(session.id)}
                >
                  <div className="icon-stack">
                    {session.playerIds.slice(0, 4).map((playerId) => {
                      const player = state.players.find((p) => p.id === playerId);
                      return player ? <IconAvatar key={playerId} icon={player.icon} size="sm" /> : null;
                    })}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600 }}>{new Date(session.endedAt ?? session.startedAt).toLocaleDateString()}</p>
                    {winner && (
                      <p className="gold" style={{ fontSize: 13 }}>
                        {state.players.find((p) => p.id === winner.playerId)?.name ?? '?'} +{formatCents(winner.netCents, currency)}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
