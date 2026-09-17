import { beforeEach, describe, expect, it } from 'vitest';
import { defaultState, loadState, saveState, STORAGE_KEY, type AppState } from './store';

describe('store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns the default state when no key is stored', () => {
    expect(loadState()).toEqual(defaultState());
  });

  it('round-trips a saved state', () => {
    const state: AppState = {
      version: 1,
      players: [{ id: 'p1', name: 'Joe', icon: 'crown', createdAt: 1 }],
      sessions: [],
      activeSessionId: null,
      settings: { currency: '€' },
    };
    saveState(state);
    expect(loadState()).toEqual(state);
  });

  it('recovers to the default state on corrupt JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    expect(loadState()).toEqual(defaultState());
  });

  it('recovers to the default state when the stored shape is wrong', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'bar' }));
    expect(loadState()).toEqual(defaultState());
  });
});
