export interface Pot {
  label: string;
  amountCents: number;
  winnerIds: string[];
}

export interface PotBreakdownEntry {
  potLabel: string;
  playerId: string;
  amountCents: number;
}

export interface SplitPotsResult {
  perPlayer: Record<string, number>;
  breakdown: PotBreakdownEntry[];
}

/**
 * Standalone in-hand chip calculator; never touches the session ledger.
 * Chop remainders (indivisible cents) go to the first-listed winner.
 */
export function splitPots(pots: Pot[]): SplitPotsResult {
  const perPlayer: Record<string, number> = {};
  const breakdown: PotBreakdownEntry[] = [];

  for (const pot of pots) {
    if (pot.winnerIds.length === 0) {
      throw new Error(`splitPots: pot "${pot.label}" has no winners`);
    }
    const share = Math.floor(pot.amountCents / pot.winnerIds.length);
    const remainder = pot.amountCents - share * pot.winnerIds.length;

    pot.winnerIds.forEach((playerId, index) => {
      const amountCents = share + (index === 0 ? remainder : 0);
      breakdown.push({ potLabel: pot.label, playerId, amountCents });
      perPlayer[playerId] = (perPlayer[playerId] ?? 0) + amountCents;
    });
  }

  return { perPlayer, breakdown };
}
