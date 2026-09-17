import { describe, expect, it } from 'vitest';
import { suggestSettlement, type NetEntry } from './settle';

function conserve(nets: NetEntry[], transactions: ReturnType<typeof suggestSettlement>): void {
  const paid: Record<string, number> = {};
  const received: Record<string, number> = {};
  for (const tx of transactions) {
    expect(tx.amountCents).toBeGreaterThan(0);
    paid[tx.fromPlayerId] = (paid[tx.fromPlayerId] ?? 0) + tx.amountCents;
    received[tx.toPlayerId] = (received[tx.toPlayerId] ?? 0) + tx.amountCents;
  }
  for (const entry of nets) {
    if (entry.netCents < 0) {
      expect(paid[entry.playerId] ?? 0).toBe(-entry.netCents);
    } else if (entry.netCents > 0) {
      expect(received[entry.playerId] ?? 0).toBe(entry.netCents);
    }
  }
}

describe('suggestSettlement', () => {
  it('throws when nets do not sum to zero', () => {
    expect(() => suggestSettlement([{ playerId: 'a', netCents: 100 }])).toThrow();
  });

  it('settles an exact pair in a single transaction', () => {
    const nets: NetEntry[] = [
      { playerId: 'a', netCents: -500 },
      { playerId: 'b', netCents: 500 },
    ];
    const transactions = suggestSettlement(nets);
    expect(transactions).toEqual([{ fromPlayerId: 'a', toPlayerId: 'b', amountCents: 500 }]);
  });

  it('settles the classic 4-player case with conservation and <= 3 transactions', () => {
    const nets: NetEntry[] = [
      { playerId: 'A', netCents: -6000 },
      { playerId: 'B', netCents: 8000 },
      { playerId: 'C', netCents: -5000 },
      { playerId: 'D', netCents: 3000 },
    ];
    const transactions = suggestSettlement(nets);
    expect(transactions.length).toBeLessThanOrEqual(3);
    conserve(nets, transactions);
  });

  it('produces deterministic output for the same input', () => {
    const nets: NetEntry[] = [
      { playerId: 'A', netCents: -6000 },
      { playerId: 'B', netCents: 8000 },
      { playerId: 'C', netCents: -5000 },
      { playerId: 'D', netCents: 3000 },
    ];
    expect(suggestSettlement(nets)).toEqual(suggestSettlement(nets));
  });

  it('holds conservation, no-zero-tx and <= n-1 tx count over randomized zero-sum nets', () => {
    let seed = 42;
    const random = (): number => {
      // xorshift32, deterministic across runs
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      seed |= 0;
      return (seed >>> 0) / 0xffffffff;
    };

    for (let iteration = 0; iteration < 100; iteration += 1) {
      const playerCount = 3 + Math.floor(random() * 6); // 3..8
      const amounts: number[] = [];
      for (let i = 0; i < playerCount - 1; i += 1) {
        amounts.push(Math.floor(random() * 20000) - 10000);
      }
      const last = -amounts.reduce((sum, v) => sum + v, 0);
      amounts.push(last);

      const nets: NetEntry[] = amounts.map((netCents, index) => ({
        playerId: `player-${index}`,
        netCents,
      }));

      const transactions = suggestSettlement(nets);
      conserve(nets, transactions);

      const nonzeroCount = nets.filter((n) => n.netCents !== 0).length;
      expect(transactions.length).toBeLessThanOrEqual(Math.max(0, nonzeroCount - 1));

      expect(suggestSettlement(nets)).toEqual(transactions);
    }
  });
});
