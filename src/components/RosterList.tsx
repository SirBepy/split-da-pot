import { Check, PencilSimple, Plus } from '@phosphor-icons/react';
import { useState } from 'react';
import { createId } from '../domain/types';
import { useApp } from '../state/AppContext';
import { IconAvatar } from './IconAvatar';
import { nextIconName } from './iconPool';

type Mode = 'select' | 'add' | 'manage';

interface RosterListProps {
  mode: Mode;
  selectedIds?: Set<string>;
  excludeIds?: Set<string>;
  onToggle?: (id: string) => void;
  onAdd?: (id: string) => void;
}

export function RosterList({ mode, selectedIds, excludeIds, onToggle, onAdd }: RosterListProps) {
  const { state, dispatch } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const players = state.players.filter((player) => !excludeIds?.has(player.id));

  function startEdit(id: string, currentName: string) {
    setEditingId(id);
    setEditingName(currentName);
  }

  function commitEdit() {
    if (editingId) {
      const name = editingName.trim() || 'Player';
      dispatch({ type: 'RENAME_PLAYER', playerId: editingId, name });
    }
    setEditingId(null);
    setEditingName('');
  }

  function cycleIcon(playerId: string, currentIcon: string) {
    const icon = nextIconName([currentIcon]);
    dispatch({ type: 'SET_PLAYER_ICON', playerId, icon });
  }

  function createPlayer() {
    const id = createId();
    const icon = nextIconName(state.players.map((p) => p.icon));
    dispatch({ type: 'ADD_PLAYER', player: { id, name: 'New player', icon, createdAt: Date.now() } });
    startEdit(id, 'New player');
    if (mode === 'select') onToggle?.(id);
    if (mode === 'add') onAdd?.(id);
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {players.map((player, index) => {
        const isSelected = mode === 'select' && selectedIds?.has(player.id);
        const isEditing = editingId === player.id;
        return (
          <div
            key={player.id}
            className="player-row"
            style={index > 0 ? { borderTop: '1px solid var(--line)' } : undefined}
          >
            {mode === 'manage' ? (
              <button
                type="button"
                onClick={() => cycleIcon(player.id, player.icon)}
                aria-label={`Change ${player.name}'s icon`}
                style={{ display: 'flex' }}
              >
                <IconAvatar icon={player.icon} />
              </button>
            ) : (
              <IconAvatar icon={player.icon} />
            )}
            <div className="player-row__body">
              {isEditing ? (
                <input
                  className="text-input"
                  style={{ minHeight: 36, padding: '0 10px' }}
                  autoFocus
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') commitEdit();
                  }}
                  aria-label="Player name"
                />
              ) : (
                <button
                  type="button"
                  className="player-row__name"
                  style={{ display: 'block', textAlign: 'left', width: '100%' }}
                  onClick={() => {
                    if (mode === 'select') onToggle?.(player.id);
                    if (mode === 'add') onAdd?.(player.id);
                  }}
                >
                  {player.name}
                </button>
              )}
            </div>
            {!isEditing && (
              <button
                type="button"
                className="icon-btn"
                aria-label={`Rename ${player.name}`}
                onClick={() => startEdit(player.id, player.name)}
              >
                <PencilSimple size={18} />
              </button>
            )}
            {isSelected && (
              <span className="avatar avatar--sm" style={{ background: 'var(--gold)', color: 'var(--bg)' }}>
                <Check size={16} weight="bold" />
              </span>
            )}
          </div>
        );
      })}
      <button
        type="button"
        className="player-row"
        style={{ borderTop: players.length > 0 ? '1px solid var(--line)' : undefined, color: 'var(--gold)' }}
        onClick={createPlayer}
      >
        <span className="avatar avatar--md">
          <Plus size={20} />
        </span>
        <span style={{ fontWeight: 600 }}>New player</span>
      </button>
    </div>
  );
}
