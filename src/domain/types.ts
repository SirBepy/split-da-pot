export interface Player {
  id: string;
  name: string;
  icon: string;
  createdAt: number;
}

export type LedgerEntryKind = 'buy-in' | 'cash-out';

export interface LedgerEntry {
  id: string;
  playerId: string;
  kind: LedgerEntryKind;
  amountCents: number;
  at: number;
}

export type SessionStatus = 'active' | 'counting' | 'settled';

export interface Session {
  id: string;
  startedAt: number;
  endedAt: number | null;
  playerIds: string[];
  entries: LedgerEntry[];
  finalCounts: Record<string, number>;
  status: SessionStatus;
}

export interface Settings {
  currency: string;
}

export interface Transaction {
  fromPlayerId: string;
  toPlayerId: string;
  amountCents: number;
}

export function createId(): string {
  return crypto.randomUUID();
}
