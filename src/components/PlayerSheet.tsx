import { useState } from 'react';
import { centsToInputValue, formatCents, parseAmountToCents } from '../domain/money';
import type { Player } from '../domain/types';
import { useApp } from '../state/useApp';
import { AmountEntry } from './AmountEntry';
import { IconAvatar } from './IconAvatar';
import { IconPickerSheet } from './IconPickerSheet';
import { InlineEdit } from './InlineEdit';
import { Sheet } from './Sheet';
import { SwipeRow } from './SwipeRow';

interface PlayerSheetProps {
  sessionId: string;
  player: Player;
  onClose: () => void;
}

type Tab = 'buyin' | 'cashout' | 'log';

export function PlayerSheet({ sessionId, player, onClose }: PlayerSheetProps) {
  const { state, dispatch, activeSession } = useApp();
  const [tab, setTab] = useState<Tab>('buyin');
  const [pickingIcon, setPickingIcon] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);
  const currency = state.settings.currency;
  const session = activeSession;

  function addEntry(kind: 'buy-in' | 'cash-out', amountCents: number) {
    dispatch({
      type: 'ADD_ENTRY',
      sessionId,
      entry: { playerId: player.id, kind, amountCents, at: Date.now() },
    });
  }

  function commitEntryEdit(entryId: string) {
    const cents = parseAmountToCents(editValue);
    if (cents !== null && cents > 0) {
      dispatch({ type: 'EDIT_ENTRY', sessionId, entryId, amountCents: cents });
    }
    setEditingEntryId(null);
  }

  const entries = (session?.entries ?? [])
    .filter((entry) => entry.playerId === player.id)
    .slice()
    .sort((a, b) => b.at - a.at);

  return (
    <Sheet onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: -8 }}>
        <button type="button" aria-label={`Change ${player.name}'s icon`} style={{ display: 'flex' }} onClick={() => setPickingIcon(true)}>
          <IconAvatar icon={player.icon} size="lg" />
        </button>
        <InlineEdit
          value={player.name}
          ariaLabel="player name"
          onCommit={(name) => dispatch({ type: 'RENAME_PLAYER', playerId: player.id, name })}
          displayClassName="display"
          displayStyle={{ fontSize: 22, flex: 1 }}
        />
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
            <SwipeRow
              key={entry.id}
              open={openSwipeId === entry.id}
              onOpenChange={(open) => setOpenSwipeId(open ? entry.id : null)}
              onAction={() => {
                setOpenSwipeId(null);
                dispatch({ type: 'REMOVE_ENTRY', sessionId, entryId: entry.id });
              }}
              actionLabel="Delete"
            >
              <div className="card player-row">
                {editingEntryId === entry.id ? (
                  <input
                    className="money-input"
                    style={{ width: 96 }}
                    inputMode="decimal"
                    autoFocus
                    value={editValue}
                    onChange={(event) => setEditValue(event.target.value)}
                    onBlur={() => commitEntryEdit(entry.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') commitEntryEdit(entry.id);
                    }}
                    aria-label="Edit entry amount"
                  />
                ) : (
                  <button
                    type="button"
                    aria-label={`Edit ${entry.kind === 'buy-in' ? 'buy-in' : 'cash-out'} amount`}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      font: 'inherit',
                      minHeight: 44,
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                    onClick={() => {
                      setEditingEntryId(entry.id);
                      setEditValue(centsToInputValue(entry.amountCents));
                    }}
                  >
                    <span className={entry.kind === 'buy-in' ? 'gold' : 'danger-text'} style={{ fontWeight: 700 }}>
                      {entry.kind === 'buy-in' ? '+' : '-'}
                      {formatCents(entry.amountCents, currency)}
                    </span>
                  </button>
                )}
                <span className="dim" style={{ flex: 1, fontSize: 12 }}>
                  {new Date(entry.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </SwipeRow>
          ))}
        </div>
      )}

      {pickingIcon && (
        <IconPickerSheet
          current={player.icon}
          onPick={(icon) => dispatch({ type: 'SET_PLAYER_ICON', playerId: player.id, icon })}
          onClose={() => setPickingIcon(false)}
        />
      )}
    </Sheet>
  );
}
