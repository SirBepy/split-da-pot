import { Check, Plus } from '@phosphor-icons/react';
import { useState } from 'react';
import { createId } from '../domain/types';
import type { Player } from '../domain/types';
import { useApp } from '../state/useApp';
import { IconAvatar } from './IconAvatar';
import { IconPickerSheet } from './IconPickerSheet';
import { InlineEdit } from './InlineEdit';
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
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null);
  const [iconTarget, setIconTarget] = useState<Player | null>(null);

  const players = state.players.filter((player) => !excludeIds?.has(player.id));

  function createPlayer() {
    const id = createId();
    const icon = nextIconName(state.players.map((p) => p.icon));
    dispatch({ type: 'ADD_PLAYER', player: { id, name: 'New player', icon, createdAt: Date.now() } });
    setJustCreatedId(id);
    if (mode === 'select') onToggle?.(id);
    if (mode === 'add') onAdd?.(id);
  }

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {players.map((player, index) => {
        const isSelected = mode === 'select' && !!selectedIds?.has(player.id);
        const borderTop = index > 0 ? { borderTop: '1px solid var(--line)' } : undefined;

        if (mode === 'add') {
          return (
            <button
              key={player.id}
              type="button"
              className="player-row"
              style={{ ...borderTop, width: '100%' }}
              onClick={() => onAdd?.(player.id)}
            >
              <IconAvatar icon={player.icon} />
              <span className="player-row__name" style={{ flex: 1, textAlign: 'left' }}>
                {player.name}
              </span>
            </button>
          );
        }

        return (
          <div key={player.id} className="player-row" style={borderTop}>
            {mode === 'manage' ? (
              <button
                type="button"
                onClick={() => setIconTarget(player)}
                aria-label={`Change ${player.name}'s icon`}
                style={{ display: 'flex' }}
              >
                <IconAvatar icon={player.icon} />
              </button>
            ) : (
              <IconAvatar icon={player.icon} />
            )}
            <div className="player-row__body">
              <InlineEdit
                value={player.name}
                ariaLabel="player name"
                startInEdit={player.id === justCreatedId}
                onCommit={(name) => dispatch({ type: 'RENAME_PLAYER', playerId: player.id, name })}
                displayClassName="player-row__name"
                displayStyle={{ width: '100%' }}
              />
            </div>
            {mode === 'select' && (
              <button
                type="button"
                className="icon-btn"
                aria-label={`${isSelected ? 'Deselect' : 'Select'} ${player.name}`}
                aria-pressed={isSelected}
                onClick={() => onToggle?.(player.id)}
              >
                <span className={`select-circle ${isSelected ? 'select-circle--on' : ''}`}>
                  {isSelected && <Check size={16} weight="bold" />}
                </span>
              </button>
            )}
          </div>
        );
      })}
      <button
        type="button"
        className="player-row"
        style={{ borderTop: players.length > 0 ? '1px solid var(--line)' : undefined, color: 'var(--gold)', width: '100%' }}
        onClick={createPlayer}
      >
        <span className="avatar avatar--md">
          <Plus size={20} />
        </span>
        <span style={{ fontWeight: 600 }}>New player</span>
      </button>

      {iconTarget && (
        <IconPickerSheet
          current={iconTarget.icon}
          onPick={(icon) => dispatch({ type: 'SET_PLAYER_ICON', playerId: iconTarget.id, icon })}
          onClose={() => setIconTarget(null)}
        />
      )}
    </div>
  );
}
