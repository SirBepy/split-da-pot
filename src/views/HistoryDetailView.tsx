import { ArrowDown, ArrowUp, CaretLeft, Minus } from '@phosphor-icons/react';
import { IconAvatar } from '../components/IconAvatar';
import { netCents } from '../domain/ledger';
import { formatCents } from '../domain/money';
import { suggestSettlement } from '../domain/settle';
import { useApp } from '../state/AppContext';

export function HistoryDetailView() {
  const { state, historyDetailId, backFromHistoryDetail } = useApp();
  const currency = state.settings.currency;
  const session = state.sessions.find((s) => s.id === historyDetailId);

  if (!session) return null;

  const nets = session.playerIds.map((playerId) => ({ playerId, netCents: netCents(session, playerId) }));
  const transactions = suggestSettlement(nets);

  function playerName(id: string) {
    return state.players.find((p) => p.id === id)?.name ?? '?';
  }
  function playerIcon(id: string) {
    return state.players.find((p) => p.id === id)?.icon ?? 'crown';
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="top-bar">
          <button type="button" className="icon-btn" aria-label="Back to history" onClick={backFromHistoryDetail}>
            <CaretLeft size={20} />
          </button>
          <p className="display screen-header__title--small">
            {new Date(session.endedAt ?? session.startedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="screen-body">
        <h2 className="dim" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Nets
        </h2>
        {nets.map(({ playerId, netCents: net }) => (
          <div key={playerId} className="card player-row">
            <IconAvatar icon={playerIcon(playerId)} size="sm" />
            <p style={{ flex: 1, fontWeight: 600 }}>{playerName(playerId)}</p>
            {net > 0 && (
              <span className="gold display" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ArrowUp size={16} weight="bold" />
                {formatCents(net, currency)}
              </span>
            )}
            {net < 0 && (
              <span className="danger-text display" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ArrowDown size={16} weight="bold" />
                {formatCents(Math.abs(net), currency)}
              </span>
            )}
            {net === 0 && (
              <span className="dim" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Minus size={16} />
                {currency}0
              </span>
            )}
          </div>
        ))}

        <h2 className="dim" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 8 }}>
          Settlement
        </h2>
        {transactions.length === 0 && <p className="dim">Everyone was even.</p>}
        {transactions.map((tx, index) => (
          <div key={index} className="card tx-card">
            <IconAvatar icon={playerIcon(tx.fromPlayerId)} />
            <p className="tx-card__text">
              <strong>{playerName(tx.fromPlayerId)}</strong> pays <strong>{playerName(tx.toPlayerId)}</strong>{' '}
              <span className="gold display">{formatCents(tx.amountCents, currency)}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
