import { describe, expect, it } from 'vitest';
import { defaultState } from '../storage/store';
import { reducer } from './reducer';

function withPlayers() {
  let state = defaultState();
  state = reducer(state, {
    type: 'ADD_PLAYER',
    player: { id: 'p1', name: 'Joe', icon: 'crown', createdAt: 1 },
  });
  state = reducer(state, {
    type: 'ADD_PLAYER',
    player: { id: 'p2', name: 'Bruno', icon: 'skull', createdAt: 2 },
  });
  return state;
}

describe('reducer', () => {
  it('starts a night with the selected roster', () => {
    const state = withPlayers();
    const next = reducer(state, {
      type: 'START_SESSION',
      session: {
        id: 's1',
        startedAt: 10,
        endedAt: null,
        playerIds: ['p1', 'p2'],
        entries: [],
        finalCounts: {},
        status: 'active',
      },
    });
    expect(next.activeSessionId).toBe('s1');
    expect(next.sessions).toHaveLength(1);
    expect(next.sessions[0].playerIds).toEqual(['p1', 'p2']);
  });

  it('records a buy-in against the active session', () => {
    let state = withPlayers();
    state = reducer(state, {
      type: 'START_SESSION',
      session: {
        id: 's1',
        startedAt: 10,
        endedAt: null,
        playerIds: ['p1', 'p2'],
        entries: [],
        finalCounts: {},
        status: 'active',
      },
    });
    state = reducer(state, {
      type: 'ADD_ENTRY',
      sessionId: 's1',
      entry: { playerId: 'p1', kind: 'buy-in', amountCents: 2000, at: 11 },
    });
    expect(state.sessions[0].entries).toHaveLength(1);
    expect(state.sessions[0].entries[0]).toMatchObject({ playerId: 'p1', kind: 'buy-in', amountCents: 2000 });
  });

  it('records a cash-out the same way as a buy-in, opposite kind', () => {
    let state = withPlayers();
    state = reducer(state, {
      type: 'START_SESSION',
      session: {
        id: 's1',
        startedAt: 10,
        endedAt: null,
        playerIds: ['p1', 'p2'],
        entries: [{ id: 'e1', playerId: 'p1', kind: 'buy-in', amountCents: 3000, at: 11 }],
        finalCounts: {},
        status: 'active',
      },
    });
    state = reducer(state, {
      type: 'ADD_ENTRY',
      sessionId: 's1',
      entry: { playerId: 'p1', kind: 'cash-out', amountCents: 1000, at: 12 },
    });
    expect(state.sessions[0].entries).toHaveLength(2);
    expect(state.sessions[0].entries[1].kind).toBe('cash-out');
  });

  it('deletes a ledger entry, recomputing what remains untouched by other entries', () => {
    let state = withPlayers();
    state = reducer(state, {
      type: 'START_SESSION',
      session: {
        id: 's1',
        startedAt: 10,
        endedAt: null,
        playerIds: ['p1'],
        entries: [
          { id: 'e1', playerId: 'p1', kind: 'buy-in', amountCents: 2000, at: 11 },
          { id: 'e2', playerId: 'p1', kind: 'buy-in', amountCents: 1000, at: 12 },
        ],
        finalCounts: {},
        status: 'active',
      },
    });
    state = reducer(state, { type: 'REMOVE_ENTRY', sessionId: 's1', entryId: 'e1' });
    expect(state.sessions[0].entries).toEqual([
      { id: 'e2', playerId: 'p1', kind: 'buy-in', amountCents: 1000, at: 12 },
    ]);
  });

  it('adds a latecomer to an in-progress session without duplicating an existing player', () => {
    let state = withPlayers();
    state = reducer(state, {
      type: 'START_SESSION',
      session: {
        id: 's1',
        startedAt: 10,
        endedAt: null,
        playerIds: ['p1'],
        entries: [],
        finalCounts: {},
        status: 'active',
      },
    });
    state = reducer(state, { type: 'ADD_LATECOMER', sessionId: 's1', playerId: 'p2' });
    expect(state.sessions[0].playerIds).toEqual(['p1', 'p2']);
    // adding the same player twice is a no-op
    state = reducer(state, { type: 'ADD_LATECOMER', sessionId: 's1', playerId: 'p2' });
    expect(state.sessions[0].playerIds).toEqual(['p1', 'p2']);
  });

  it('sets a final count during counting and clears it when the field is emptied', () => {
    let state = withPlayers();
    state = reducer(state, {
      type: 'START_SESSION',
      session: {
        id: 's1',
        startedAt: 10,
        endedAt: null,
        playerIds: ['p1', 'p2'],
        entries: [],
        finalCounts: {},
        status: 'active',
      },
    });
    state = reducer(state, { type: 'ENTER_COUNTING', sessionId: 's1' });
    expect(state.sessions[0].status).toBe('counting');
    state = reducer(state, { type: 'SET_FINAL_COUNT', sessionId: 's1', playerId: 'p1', amountCents: 4500 });
    expect(state.sessions[0].finalCounts).toEqual({ p1: 4500 });
    state = reducer(state, { type: 'CLEAR_FINAL_COUNT', sessionId: 's1', playerId: 'p1' });
    expect(state.sessions[0].finalCounts).toEqual({});
  });

  it('settles a night: status becomes settled, endedAt is stamped, session no longer active', () => {
    let state = withPlayers();
    state = reducer(state, {
      type: 'START_SESSION',
      session: {
        id: 's1',
        startedAt: 10,
        endedAt: null,
        playerIds: ['p1', 'p2'],
        entries: [
          { id: 'e1', playerId: 'p1', kind: 'buy-in', amountCents: 5000, at: 11 },
        ],
        finalCounts: { p1: 3000, p2: 2000 },
        status: 'counting',
      },
    });
    state = reducer(state, { type: 'FINISH_SETTLEMENT', sessionId: 's1', endedAt: 999 });
    expect(state.sessions[0].status).toBe('settled');
    expect(state.sessions[0].endedAt).toBe(999);
    expect(state.activeSessionId).toBeNull();
  });

  it('renames a player and updates their icon without touching other players', () => {
    let state = withPlayers();
    state = reducer(state, { type: 'RENAME_PLAYER', playerId: 'p1', name: 'Josip' });
    state = reducer(state, { type: 'SET_PLAYER_ICON', playerId: 'p1', icon: 'ghost' });
    expect(state.players[0]).toMatchObject({ name: 'Josip', icon: 'ghost' });
    expect(state.players[1]).toMatchObject({ name: 'Bruno', icon: 'skull' });
  });

  it('updates the currency symbol in settings', () => {
    const state = reducer(defaultState(), { type: 'UPDATE_SETTINGS', currency: '$' });
    expect(state.settings.currency).toBe('$');
  });
});
