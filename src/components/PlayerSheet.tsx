import { PencilSimple, Trash } from '@phosphor-icons/react';
import { useState } from 'react';
import { formatCents } from '../domain/money';
import type { Player } from '../domain/types';
import { useApp } from '../state/AppContext';
import { AmountEntry } from './AmountEntry';
import { IconAvatar } from './IconAvatar';
import { Sheet } from './Sheet';

interface PlayerSheetProps {
  sessionId: string;
  player: Player;
  onClose: () => void;
}

type Tab = 'buyin' | 'cashout' | 'log';

export function PlayerSheet({ sessionId, player, onClose }: PlayerSheetProps) {
  const { state, dispatch, activeSession } = useApp();
  const [tab, setTab] = useState<Tab>('buyin');
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(player.name);
  const currency = state.settings.currency;
  const session = activeSession;

  function addEntry(kind: 'buy-in' | 'cash-out', amountCents: number) {
    dispatch({
      type: 'ADD_ENTRY',
      sessionId,
      entry: { playerId: player.id, kind, amountCents, at: Date.now() },
    });
  }

  function commitName() {
    const trimmed = name.trim() || player.name;
    dispatch({ type: 'RENAME_PLAYER', playerId: player.id, name: trimmed });
    setEditingName(false);
  }

  const entries = (session?.entries ?? [])
    .filter((entry) => entry.playerId === player.id)
    .slice()
    .sort((a, b) => b.at - a.at);

  return (
    <Sheet onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: -8 }}>
        <IconAvatar icon={player.icon} size="lg" />
        {editingName ? (
          <input
            className="text-input"
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={commitName}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitName();
            }}
            aria-label="Player name"
          />
        ) : (
          <>
            <h2 className="display" style={{ fontSize: 22, flex: 1 }}>
              {player.name}
            </h2>
            <button type="button" className="icon-btn" aria-label="Rename player" onClick={() => setEditingName(true)}>
              <PencilSimple size={18} />
            </button>
          </>
        )}
      </div>

      <div className="tab-row">
        <button type="button" className={`tab ${tab === 'buyin' ? 'tab--active' : ''}`} onClick={() => setTab('buyin')}>
          Buy-in
        </button>
        <button
          type="button"
          className={`tab ${tab === 'cashout' ? 'tab--active' : ''}`}
          onClick={() => setTab('cashout')}
        >
          Cash out
        </button>
        <button type="button" className={`tab ${tab === 'log' ? 'tab--active' : ''}`} onClick={() => setTab('log')}>
          Log
        </button>
      </div>

      {tab === 'buyin' && (
        <AmountEntry currency={currency} submitLabel="Add buy-in" onSubmit={(cents) => addEntry('buy-in', cents)} />
      )}
      {tab === 'cashout' && (
        <AmountEntry
          currency={currency}
          submitLabel="Cash out"
          submitVariant="danger"
          onSubmit={(cents) => addEntry('cash-out', cents)}
        />
      )}
      {tab === 'log' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {entries.length === 0 && <p className="dim">No entries yet.</p>}
          {entries.map((entry) => (
            <div key={entry.id} className="card player-row">
              <span className={entry.kind === 'buy-in' ? 'gold' : 'danger-text'} style={{ fontWeight: 700 }}>
                {entry.kind === 'buy-in' ? '+' : '-'}
                {formatCents(entry.amountCents, currency)}
              </span>
              <span className="dim" style={{ flex: 1, fontSize: 12 }}>
                {new Date(entry.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button
                type="button"
                className="icon-btn"
                aria-label="Delete entry"
                onClick={() => dispatch({ type: 'REMOVE_ENTRY', sessionId, entryId: entry.id })}
              >
                <Trash size={18} className="danger-text" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Sheet>
  );
}
