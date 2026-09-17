import { netCents } from '../domain/ledger';
import { suggestSettlement } from '../domain/settle';
import type { Player, Session } from '../domain/types';

// Plain function, not a use* hook: SettleView derives this after an early
// guard return, where calling a hook would break the rules-of-hooks.
export function settlementView(session: Session, players: Player[]) {
  const nets = session.playerIds.map((playerId) => ({ playerId, netCents: netCents(session, playerId) }));
  const transactions = suggestSettlement(nets);
  const playerName = (id: string) => players.find((p) => p.id === id)?.name ?? '?';
  const playerIcon = (id: string) => players.find((p) => p.id === id)?.icon ?? 'crown';
  return { nets, transactions, playerName, playerIcon };
}
