import { describe, expect, it } from 'vitest';
import { splitPots, type Pot } from './runit';

describe('splitPots', () => {
  it('awards a single pot to its single winner', () => {
    const pots: Pot[] = [{ label: 'main', amountCents: 5000, winnerIds: ['a'] }];
    const result = splitPots(pots);
    expect(result.perPlayer).toEqual({ a: 5000 });
    expect(result.breakdown).toEqual([{ potLabel: 'main', playerId: 'a', amountCents: 5000 }]);
  });

  it('splits a run-it-twice pot evenly between two winners', () => {
    const pots: Pot[] = [{ label: 'main', amountCents: 4000, winnerIds: ['a', 'b'] }];
    const result = splitPots(pots);
    expect(result.perPlayer).toEqual({ a: 2000, b: 2000 });
  });

  it('gives the odd cent remainder to the first-listed winner on a chop', () => {
    const pots: Pot[] = [{ label: 'main', amountCents: 101, winnerIds: ['a', 'b', 'c'] }];
    const result = splitPots(pots);
    // 101 / 3 = 33 each, remainder 2 goes to first winner "a"
    expect(result.perPlayer).toEqual({ a: 35, b: 33, c: 33 });
  });

  it('handles multiple side pots with different winner sets', () => {
    const pots: Pot[] = [
      { label: 'main', amountCents: 3000, winnerIds: ['a', 'b'] },
      { label: 'side-1', amountCents: 1000, winnerIds: ['a'] },
      { label: 'side-2', amountCents: 500, winnerIds: ['b', 'c'] },
    ];
    const result = splitPots(pots);
    expect(result.perPlayer).toEqual({ a: 1500 + 1000, b: 1500 + 250, c: 250 });
    expect(result.breakdown).toHaveLength(5);
  });

  it('conserves total chips across all pots and players', () => {
    const pots: Pot[] = [
      { label: 'main', amountCents: 3333, winnerIds: ['a', 'b', 'c'] },
      { label: 'side-1', amountCents: 777, winnerIds: ['a', 'd'] },
    ];
    const result = splitPots(pots);
    const potSum = pots.reduce((sum, pot) => sum + pot.amountCents, 0);
    const perPlayerSum = Object.values(result.perPlayer).reduce((sum, v) => sum + v, 0);
    const breakdownSum = result.breakdown.reduce((sum, entry) => sum + entry.amountCents, 0);
    expect(perPlayerSum).toBe(potSum);
    expect(breakdownSum).toBe(potSum);
  });

  it('throws when a pot has no winners', () => {
    const pots: Pot[] = [{ label: 'main', amountCents: 100, winnerIds: [] }];
    expect(() => splitPots(pots)).toThrow();
  });
});
