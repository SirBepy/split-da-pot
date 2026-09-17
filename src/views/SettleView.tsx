import { ArrowDown, ArrowUp, Check, Minus } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { IconAvatar } from '../components/IconAvatar';
import { canSettle } from '../domain/ledger';
import { formatCents } from '../domain/money';
import { useApp } from '../state/useApp';
import { settlementView } from './settlementView';

export function SettleView() {
  const { state, activeSession, goToCount, finishNight } = useApp();
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const currency = state.settings.currency;
  const session = activeSession;
  const guardFailed = !session || !canSettle(session);

  useEffect(() => {
    if (guardFailed) goToCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guardFailed]);

  if (guardFailed || !session) return null;

  const { nets, transactions, playerName, playerIcon } = settlementView(session, state.players);

  function toggleChecked(index: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <p className="screen-header__eyebrow">End of night</p>
        <p className="display screen-header__title--small">Settle up</p>
      </div>
      <div className="screen-body">
        <div className="chip-row">
          {nets.map(({ playerId, netCents: net }) => (
            <span key={playerId} className="net-pill">
              <IconAvatar icon={playerIcon(playerId)} size="sm" />
              {playerName(playerId)}
              {net > 0 && (
                <span className="gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                  <ArrowUp size={14} weight="bold" />
                  {formatCents(net, currency)}
                </span>
              )}
              {net < 0 && (
                <span className="danger-text" style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                  <ArrowDown size={14} weight="bold" />
                  {formatCents(Math.abs(net), currency)}
                </span>
              )}
              {net === 0 && (
                <span className="dim" style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                  <Minus size={14} />
                  {currency}0
                </span>
              )}
            </span>
          ))}
        </div>

        <h2 className="dim" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 8 }}>
          Suggested split
        </h2>
        {transactions.length === 0 && <p className="dim">Everyone's even. Nobody owes anybody.</p>}
        {transactions.map((tx, index) => (
          <button
            key={`${tx.fromPlayerId}-${tx.toPlayerId}-${index}`}
            type="button"
            className={`card tx-card ${checked.has(index) ? 'tx-card--done' : ''}`}
            style={{ width: '100%', textAlign: 'left' }}
            onClick={() => toggleChecked(index)}
          >
            <IconAvatar icon={playerIcon(tx.fromPlayerId)} />
            <p className="tx-card__text">
              <strong>{playerName(tx.fromPlayerId)}</strong> pays <strong>{playerName(tx.toPlayerId)}</strong>{' '}
              <span className="gold display">{formatCents(tx.amountCents, currency)}</span>
            </p>
            <span className={`checkbox ${checked.has(index) ? 'checkbox--checked' : ''}`}>
              {checked.has(index) && <Check size={16} weight="bold" />}
            </span>
          </button>
        ))}
      </div>
      <div className="bottom-bar">
        <button type="button" className="btn btn-primary btn-block" onClick={() => finishNight(session.id)}>
          Finish da night
        </button>
      </div>
    </div>
  );
}
