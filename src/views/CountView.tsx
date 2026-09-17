import { CaretLeft } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';
import { centsToInputValue } from '../domain/money';
import { IconAvatar } from '../components/IconAvatar';
import { formatCents, parseAmountToCents } from '../domain/money';
import { allCounted, canSettle, remainingCents } from '../domain/ledger';
import { useApp } from '../state/useApp';

export function CountView() {
  const { state, dispatch, activeSession, backToSessionFromCount, requestSettle } = useApp();
  const currency = state.settings.currency;
  const session = activeSession;

  const [rawValues, setRawValues] = useState<Record<string, string>>(() => {
    if (!session) return {};
    const initial: Record<string, string> = {};
    for (const [playerId, cents] of Object.entries(session.finalCounts)) {
      initial[playerId] = centsToInputValue(cents);
    }
    return initial;
  });

  const remaining = session ? remainingCents(session) : 0;
  const prevNegativeRef = useRef(remaining < 0);
  const [pulse, setPulse] = useState(false);
  const prevRemainingRef = useRef(remaining);
  const [tickClass, setTickClass] = useState('');

  useEffect(() => {
    const isNegative = remaining < 0;
    if (isNegative && !prevNegativeRef.current) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 400);
      prevNegativeRef.current = isNegative;
      return () => clearTimeout(timer);
    }
    prevNegativeRef.current = isNegative;
  }, [remaining]);

  useEffect(() => {
    if (remaining === prevRemainingRef.current) return;
    const direction = remaining > prevRemainingRef.current ? 'up' : 'down';
    prevRemainingRef.current = remaining;
    setTickClass(`pot-panel__amount--tick-${direction}`);
    const timer = setTimeout(() => setTickClass(''), 200);
    return () => clearTimeout(timer);
  }, [remaining]);

  if (!session) return null;

  function handleChange(playerId: string, raw: string) {
    setRawValues((prev) => ({ ...prev, [playerId]: raw }));
    if (raw.trim() === '') {
      dispatch({ type: 'CLEAR_FINAL_COUNT', sessionId: session!.id, playerId });
      return;
    }
    const cents = parseAmountToCents(raw);
    if (cents !== null) {
      dispatch({ type: 'SET_FINAL_COUNT', sessionId: session!.id, playerId, amountCents: cents });
    }
  }

  const panelClass = [
    'pot-panel',
    remaining < 0 ? 'pot-panel--negative' : '',
    remaining === 0 ? 'pot-panel--zero' : '',
    pulse ? 'pot-panel--pulse' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const isZero = remaining === 0;
  const everyoneCounted = allCounted(session);
  const uncounted = session.playerIds.filter((playerId) => !(playerId in session.finalCounts)).length;
  const canSplit = canSettle(session);
  const splitLabel = !isZero
    ? remaining > 0
      ? `${formatCents(remaining, currency)} left to count`
      : `${formatCents(Math.abs(remaining), currency)} too many counted`
    : everyoneCounted
      ? 'View da split'
      : uncounted === 1
        ? '1 player not counted yet'
        : `${uncounted} players not counted yet`;

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="top-bar">
          <button type="button" className="icon-btn" aria-label="Back to session" onClick={backToSessionFromCount}>
            <CaretLeft size={20} />
          </button>
          <div>
            <p className="screen-header__eyebrow">End of night</p>
            <p className="display screen-header__title--small">Count da chips</p>
          </div>
        </div>
      </div>
      <div className="screen-body">
        {session.playerIds.map((playerId) => {
          const player = state.players.find((p) => p.id === playerId);
          if (!player) return null;
          const raw = rawValues[playerId] ?? '';
          const showError = raw.trim() !== '' && parseAmountToCents(raw) === null;
          return (
            <div key={playerId} className="card">
              <div className="count-row">
                <IconAvatar icon={player.icon} size="sm" />
                <p style={{ flex: 1, fontWeight: 600 }}>{player.name}</p>
                <input
                  className={`money-input ${showError ? 'money-input--error' : ''}`}
                  inputMode="decimal"
                  placeholder={`${currency}0`}
                  value={raw}
                  onChange={(event) => handleChange(playerId, event.target.value)}
                  aria-invalid={showError}
                  aria-label={`${player.name} counted amount`}
                />
              </div>
              {showError && (
                <p className="danger-text" style={{ fontSize: 12, padding: '0 14px 10px', textAlign: 'right' }}>
                  Not a valid amount. Try 20 or 20,50.
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="bottom-bar bottom-bar--stack" style={{ gap: 10 }}>
        <div className={panelClass}>
          <p className="pot-panel__label">Left in pot</p>
          <p className={`display pot-panel__amount ${tickClass}`}>{formatCents(remaining, currency)}</p>
        </div>
        <button type="button" className="btn btn-primary btn-block" disabled={!canSplit} onClick={() => requestSettle()}>
          {splitLabel}
        </button>
      </div>
    </div>
  );
}
