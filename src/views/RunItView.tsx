import { ArrowCounterClockwise, Info, PencilSimple, X } from '@phosphor-icons/react';
import { useState } from 'react';
import { IconAvatar } from '../components/IconAvatar';
import { formatCents, parseAmountToCents } from '../domain/money';
import { splitPots, type Pot } from '../domain/runit';
import { useApp } from '../state/useApp';

function autoLabel(index: number): string {
  return index === 0 ? 'Main pot' : `Side pot ${index}`;
}

export function RunItView() {
  const { state, activeSession, closeRunIt } = useApp();
  const currency = state.settings.currency;
  const [pots, setPots] = useState<Pot[]>([]);
  const [amount, setAmount] = useState('');
  const [winnerIds, setWinnerIds] = useState<Set<string>>(new Set());
  const [label, setLabel] = useState(autoLabel(0));
  const [editingLabel, setEditingLabel] = useState(false);

  if (!activeSession) return null;
  const session = activeSession;
  const players = session.playerIds
    .map((id) => state.players.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  const amountCents = parseAmountToCents(amount);
  const canAdd = amountCents !== null && amountCents > 0 && winnerIds.size > 0;

  function toggleWinner(id: string) {
    setWinnerIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function commitLabel() {
    setLabel((prev) => prev.trim() || autoLabel(pots.length));
    setEditingLabel(false);
  }

  function addPot() {
    if (!canAdd || amountCents === null) return;
    setPots((prev) => [...prev, { label: label.trim() || autoLabel(prev.length), amountCents, winnerIds: [...winnerIds] }]);
    setLabel(autoLabel(pots.length + 1));
    setEditingLabel(false);
    setAmount('');
    setWinnerIds(new Set());
  }

  const result = pots.length > 0 ? splitPots(pots) : null;

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="top-bar" style={{ justifyContent: 'space-between' }}>
          <div>
            <p className="screen-header__eyebrow">In-hand calculator</p>
            <p className="display screen-header__title--small">Run It</p>
          </div>
          <button type="button" className="icon-btn" aria-label="Close Run It" onClick={closeRunIt}>
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="screen-body">
        <div className="card" style={{ padding: 14, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <Info size={16} className="dim" style={{ marginTop: 2, flexShrink: 0 }} />
          <p className="dim" style={{ fontSize: 13 }}>Chips only. Dis never touches da bank.</p>
        </div>

        <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {editingLabel ? (
            <input
              className="text-input"
              autoFocus
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              onBlur={commitLabel}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commitLabel();
              }}
              aria-label="Pot label"
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label className="field-label" htmlFor="runit-pot-amount">
                {label}
              </label>
              <button type="button" className="icon-btn" aria-label="Rename pot" onClick={() => setEditingLabel(true)}>
                <PencilSimple size={14} />
              </button>
            </div>
          )}
          <input
            id="runit-pot-amount"
            className="text-input"
            inputMode="decimal"
            placeholder={`${currency}0`}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && canAdd) addPot();
            }}
          />
          <div className="chip-row">
            {players.map((player) => (
              <button
                key={player.id}
                type="button"
                className={`winner-chip ${winnerIds.has(player.id) ? 'winner-chip--selected' : ''}`}
                onClick={() => toggleWinner(player.id)}
              >
                <IconAvatar icon={player.icon} size="sm" />
                {player.name}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-primary btn-block" disabled={!canAdd} onClick={addPot}>
            Add pot
          </button>
        </div>

        {result && (
          <>
            <h2 className="dim" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Result
            </h2>
            {players
              .filter((player) => result.perPlayer[player.id])
              .map((player) => (
                <div key={player.id} className="card player-row">
                  <IconAvatar icon={player.icon} size="sm" />
                  <p style={{ flex: 1, fontWeight: 600 }}>{player.name}</p>
                  <p className="display gold">{formatCents(result.perPlayer[player.id], currency)}</p>
                </div>
              ))}
            <div className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {result.breakdown.map((entry, index) => (
                <p key={index} className="dim" style={{ fontSize: 13 }}>
                  {entry.potLabel}: {state.players.find((p) => p.id === entry.playerId)?.name ?? '?'} gets{' '}
                  {formatCents(entry.amountCents, currency)}
                </p>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={() => {
                setPots([]);
                setAmount('');
                setWinnerIds(new Set());
                setLabel(autoLabel(0));
                setEditingLabel(false);
              }}
            >
              <ArrowCounterClockwise size={16} /> Clear
            </button>
          </>
        )}
      </div>
    </div>
  );
}
