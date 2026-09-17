import type { LedgerEntry, LedgerEntryKind, Session } from './types';
import { createId } from './types';

function sumEntries(session: Session, kind: LedgerEntryKind, playerId?: string): number {
  return session.entries
    .filter((entry) => entry.kind === kind && (playerId === undefined || entry.playerId === playerId))
    .reduce((sum, entry) => sum + entry.amountCents, 0);
}

export function potTotalCents(session: Session): number {
  return sumEntries(session, 'buy-in') - sumEntries(session, 'cash-out');
}

export function playerInvestedCents(session: Session, playerId: string): number {
  return sumEntries(session, 'buy-in', playerId) - sumEntries(session, 'cash-out', playerId);
}

export function countedTotalCents(session: Session): number {
  return Object.values(session.finalCounts).reduce((sum, value) => sum + value, 0);
}

export function remainingCents(session: Session): number {
  return potTotalCents(session) - countedTotalCents(session);
}

export function allCounted(session: Session): boolean {
  return session.playerIds.every((playerId) => playerId in session.finalCounts);
}

export function netCents(session: Session, playerId: string): number {
  const counted = session.finalCounts[playerId] ?? 0;
  const cashOuts = sumEntries(session, 'cash-out', playerId);
  const buyIns = sumEntries(session, 'buy-in', playerId);
  return counted + cashOuts - buyIns;
}

export function addEntry(session: Session, entry: Omit<LedgerEntry, 'id'>): Session {
  const newEntry: LedgerEntry = { ...entry, id: createId() };
  return { ...session, entries: [...session.entries, newEntry] };
}

export function removeEntry(session: Session, entryId: string): Session {
  return { ...session, entries: session.entries.filter((entry) => entry.id !== entryId) };
}

export function editEntry(
  session: Session,
  entryId: string,
  changes: Partial<Omit<LedgerEntry, 'id'>>,
): Session {
  return {
    ...session,
    entries: session.entries.map((entry) =>
      entry.id === entryId ? { ...entry, ...changes } : entry,
    ),
  };
}

export function setFinalCount(session: Session, playerId: string, amountCents: number): Session {
  return {
    ...session,
    finalCounts: { ...session.finalCounts, [playerId]: amountCents },
  };
}

export function clearFinalCount(session: Session, playerId: string): Session {
  const finalCounts = { ...session.finalCounts };
  delete finalCounts[playerId];
  return { ...session, finalCounts };
}
