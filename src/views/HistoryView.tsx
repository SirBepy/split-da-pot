import { CaretLeft } from '@phosphor-icons/react';
import { IconAvatar } from '../components/IconAvatar';
import { netCents } from '../domain/ledger';
import { formatCents } from '../domain/money';
import { useApp } from '../state/AppContext';

const FEEDBACK_URL = 'https://forms.gle/gNwNCPYFC5ACwx9z9';

export function HistoryView() {
  const { state, goHome, openHistoryDetail } = useApp();
  const currency = state.settings.currency;

  const nights = state.sessions
    .filter((session) => session.status === 'settled')
    .sort((a, b) => (b.endedAt ?? 0) - (a.endedAt ?? 0));

  function biggestWinner(session: (typeof nights)[number]) {
    let best: { name: string; net: number } | null = null;
    for (const playerId of session.playerIds) {
      const net = netCents(session, playerId);
      if (!best || net > best.net) {
        best = { name: state.players.find((p) => p.id === playerId)?.name ?? '?', net };
      }
    }
    return best;
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="top-bar">
          <button type="button" className="icon-btn" aria-label="Back" onClick={goHome}>
            <CaretLeft size={20} />
          </button>
          <p className="display screen-header__title--small">History</p>
        </div>
      </div>
      <div className="screen-body">
        {nights.length === 0 && (
          <div className="empty-state">
            <p>No settled nights yet.</p>
          </div>
        )}
        {nights.map((session) => {
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
                    {winner.name} +{formatCents(winner.net, currency)}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <p className="footer-note">
        Saved only on dis device. Want accounts + cloud sync? Tell us:{' '}
        <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer">
          {FEEDBACK_URL}
        </a>
      </p>
    </div>
  );
}
