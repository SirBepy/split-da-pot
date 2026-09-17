import type { Transaction } from './types';

export interface NetEntry {
  playerId: string;
  netCents: number;
}

interface Party {
  playerId: string;
  amount: number;
}

function byAmountDescThenId(a: Party, b: Party): number {
  if (b.amount !== a.amount) return b.amount - a.amount;
  return a.playerId < b.playerId ? -1 : a.playerId > b.playerId ? 1 : 0;
}

/**
 * Minimizes transaction count: exact-amount pairs settle in one
 * transaction, the remainder is matched greedily largest-to-largest.
 */
export function suggestSettlement(nets: NetEntry[]): Transaction[] {
  const total = nets.reduce((sum, entry) => sum + entry.netCents, 0);
  if (total !== 0) {
    throw new Error(`suggestSettlement: nets must sum to zero, got ${total}`);
  }

  let debtors: Party[] = nets
    .filter((entry) => entry.netCents < 0)
    .map((entry) => ({ playerId: entry.playerId, amount: -entry.netCents }));
  let creditors: Party[] = nets
    .filter((entry) => entry.netCents > 0)
    .map((entry) => ({ playerId: entry.playerId, amount: entry.netCents }));

  debtors.sort(byAmountDescThenId);
  creditors.sort(byAmountDescThenId);

  const transactions: Transaction[] = [];
  const usedDebtors = new Set<string>();
  const usedCreditors = new Set<string>();

  for (const debtor of debtors) {
    const match = creditors.find(
      (creditor) => !usedCreditors.has(creditor.playerId) && creditor.amount === debtor.amount,
    );
    if (match) {
      transactions.push({
        fromPlayerId: debtor.playerId,
        toPlayerId: match.playerId,
        amountCents: debtor.amount,
      });
      usedDebtors.add(debtor.playerId);
      usedCreditors.add(match.playerId);
    }
  }

  debtors = debtors.filter((debtor) => !usedDebtors.has(debtor.playerId));
  creditors = creditors.filter((creditor) => !usedCreditors.has(creditor.playerId));

  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);
    if (amount > 0) {
      transactions.push({
        fromPlayerId: debtor.playerId,
        toPlayerId: creditor.playerId,
        amountCents: amount,
      });
    }
    debtor.amount -= amount;
    creditor.amount -= amount;
    if (debtor.amount === 0) i += 1;
    if (creditor.amount === 0) j += 1;
  }

  transactions.sort((a, b) => {
    if (b.amountCents !== a.amountCents) return b.amountCents - a.amountCents;
    return a.fromPlayerId < b.fromPlayerId ? -1 : a.fromPlayerId > b.fromPlayerId ? 1 : 0;
  });

  return transactions;
}
