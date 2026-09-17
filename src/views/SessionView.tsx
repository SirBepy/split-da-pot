import { Cards, UserPlus } from '@phosphor-icons/react';
import { useState } from 'react';
import { AddPlayerSheet } from '../components/AddPlayerSheet';
import { IconAvatar } from '../components/IconAvatar';
import { PlayerSheet } from '../components/PlayerSheet';
import { formatCents } from '../domain/money';
import { playerInvestedCents, potTotalCents } from '../domain/ledger';
import { useApp } from '../state/useApp';

export function SessionView() {
  const { state, activeSession, goToCount, openRunIt } = useApp();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const currency = state.settings.currency;

  if (!activeSession) return null;
  const session = activeSession;

  const players = session.playerIds
    .map((id) => state.players.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <div className="screen">
      <div className="screen-header">
        <p className="screen-header__eyebrow">Live session</p>
        <p className="display screen-header__title">{formatCents(potTotalCents(session), currency)} in da pot</p>
        <p className="screen-header__subline">{players.length} players in</p>
      </div>
      <div className="screen-body">
        {players.map((player) => (
          <div key={player.id} className="card player-row">
            <button type="button" style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 12, minWidth: 0 }} onClick={() => setSelectedPlayerId(player.id)}>
              <IconAvatar icon={player.icon} />
              <div className="player-row__body" style={{ textAlign: 'left' }}>
                <p className="player-row__name">{player.name}</p>
                <p className="player-row__meta gold">+{formatCents(playerInvestedCents(session, player.id), currency)}</p>
              </div>
            </button>
            <button type="button" className="btn-chip" onClick={() => setSelectedPlayerId(player.id)}>
              + Buy-in
            </button>
          </div>
        ))}
        <button type="button" className="card player-row" style={{ color: 'var(--ink-dim)' }} onClick={() => setAddingPlayer(true)}>
          <span className="avatar avatar--md">
            <UserPlus size={20} />
          </span>
          <span style={{ fontWeight: 600 }}>Add player</span>
        </button>
      </div>
      <div className="bottom-bar">
        <button type="button" className="btn btn-secondary" onClick={openRunIt}>
          <Cards size={16} /> Run It
        </button>
        <button type="button" className="btn btn-primary" onClick={goToCount}>
          End night
        </button>
      </div>

      {selectedPlayerId && (
        <PlayerSheet
          sessionId={session.id}
          player={players.find((p) => p.id === selectedPlayerId)!}
          onClose={() => setSelectedPlayerId(null)}
        />
      )}
      {addingPlayer && (
        <AddPlayerSheet sessionId={session.id} alreadyInSession={session.playerIds} onClose={() => setAddingPlayer(false)} />
      )}
    </div>
  );
}
