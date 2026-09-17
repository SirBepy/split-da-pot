import { describe, expect, it } from 'vitest';
import {
  addEntry,
  allCounted,
  biggestWinner,
  canSettle,
  clearFinalCount,
  countedTotalCents,
  editEntry,
  netCents,
  playerInvestedCents,
  potTotalCents,
  remainingCents,
  removeEntry,
  setFinalCount,
} from './ledger';
import type { Session } from './types';

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 's1',
    startedAt: 0,
    endedAt: null,
    playerIds: ['p1', 'p2'],
    entries: [],
    finalCounts: {},
    status: 'active',
    ...overrides,
  };
}

describe('ledger', () => {
  it('sums buy-ins minus cash-outs for the pot total', () => {
    const session = makeSession({
      entries: [
        { id: 'e1', playerId: 'p1', kind: 'buy-in', amountCents: 2000, at: 1 },
        { id: 'e2', playerId: 'p2', kind: 'buy-in', amountCents: 1000, at: 2 },
        { id: 'e3', playerId: 'p1', kind: 'cash-out', amountCents: 500, at: 3 },
      ],
    });
    expect(potTotalCents(session)).toBe(2500);
  });

  it('goes negative when counted chips exceed the remaining pot', () => {
    const session = makeSession({
      entries: [{ id: 'e1', playerId: 'p1', kind: 'buy-in', amountCents: 1000, at: 1 }],
      finalCounts: { p1: 1500 },
    });
    expect(countedTotalCents(session)).toBe(1500);
    expect(remainingCents(session)).toBe(-500);
  });

  it('accounts for a mid-game cash-out in netCents', () => {
    const session = makeSession({
      entries: [
        { id: 'e1', playerId: 'p1', kind: 'buy-in', amountCents: 2000, at: 1 },
        { id: 'e2', playerId: 'p1', kind: 'cash-out', amountCents: 800, at: 2 },
      ],
      finalCounts: { p1: 1000 },
    });
    // counted 1000 + cash-out 800 - buy-in 2000 = -200
    expect(netCents(session, 'p1')).toBe(-200);
    expect(playerInvestedCents(session, 'p1')).toBe(1200);
  });

  it('treats an uncounted player as 0 in netCents', () => {
    const session = makeSession();
    expect(netCents(session, 'p2')).toBe(0);
    expect(allCounted(session)).toBe(false);
  });

  it('allCounted is true once every playerId has a finalCounts entry', () => {
    let session = makeSession();
    session = setFinalCount(session, 'p1', 100);
    expect(allCounted(session)).toBe(false);
    session = setFinalCount(session, 'p2', 200);
    expect(allCounted(session)).toBe(true);
  });

  it('canSettle requires zero remaining AND every player explicitly counted', () => {
    const entries = [
      { id: 'e1', playerId: 'p1', kind: 'buy-in' as const, amountCents: 1000, at: 1 },
      { id: 'e2', playerId: 'p2', kind: 'buy-in' as const, amountCents: 1000, at: 2 },
    ];
    // Coincidental zero: p1 holds the whole pot, p2 never counted.
    expect(canSettle(makeSession({ entries, finalCounts: { p1: 2000 } }))).toBe(false);
    // Everyone counted but chips missing.
    expect(canSettle(makeSession({ entries, finalCounts: { p1: 1500, p2: 0 } }))).toBe(false);
    expect(canSettle(makeSession({ entries, finalCounts: { p1: 2000, p2: 0 } }))).toBe(true);
  });

  it('biggestWinner picks the highest net player and returns null for an empty roster', () => {
    const session = makeSession({
      entries: [
        { id: 'e1', playerId: 'p1', kind: 'buy-in', amountCents: 2000, at: 1 },
        { id: 'e2', playerId: 'p2', kind: 'buy-in', amountCents: 2000, at: 2 },
      ],
      finalCounts: { p1: 500, p2: 3500 },
    });
    expect(biggestWinner(session)).toEqual({ playerId: 'p2', netCents: 1500 });
    expect(biggestWinner(makeSession({ playerIds: [] }))).toBeNull();
  });

  it('addEntry, editEntry, removeEntry, setFinalCount and clearFinalCount return new objects without mutating the input', () => {
    const original = makeSession();
    const withEntry = addEntry(original, { playerId: 'p1', kind: 'buy-in', amountCents: 1000, at: 1 });

    expect(original.entries).toHaveLength(0);
    expect(withEntry).not.toBe(original);
    expect(withEntry.entries).toHaveLength(1);
    const entryId = withEntry.entries[0].id;
    expect(typeof entryId).toBe('string');

    const edited = editEntry(withEntry, entryId, { amountCents: 1500 });
    expect(withEntry.entries[0].amountCents).toBe(1000);
    expect(edited.entries[0].amountCents).toBe(1500);
    expect(edited).not.toBe(withEntry);

    const removed = removeEntry(edited, entryId);
    expect(edited.entries).toHaveLength(1);
    expect(removed.entries).toHaveLength(0);

    const counted = setFinalCount(original, 'p1', 500);
    expect(original.finalCounts).toEqual({});
    expect(counted.finalCounts).toEqual({ p1: 500 });

    const cleared = clearFinalCount(counted, 'p1');
    expect(counted.finalCounts).toEqual({ p1: 500 });
    expect(cleared.finalCounts).toEqual({});
  });
});
