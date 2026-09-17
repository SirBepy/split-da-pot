import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { saveState } from '../storage/store';
import type { AppState } from '../storage/store';

function seedCountingSession(): AppState {
  return {
    version: 1,
    players: [
      { id: 'p1', name: 'Joe', icon: 'crown', createdAt: 1 },
      { id: 'p2', name: 'Bruno', icon: 'skull', createdAt: 2 },
    ],
    sessions: [
      {
        id: 's1',
        startedAt: 1,
        endedAt: null,
        playerIds: ['p1', 'p2'],
        entries: [
          { id: 'e1', playerId: 'p1', kind: 'buy-in', amountCents: 6000, at: 1 },
          { id: 'e2', playerId: 'p2', kind: 'buy-in', amountCents: 4000, at: 2 },
        ],
        finalCounts: {},
        status: 'counting',
      },
    ],
    activeSessionId: 's1',
    settings: { currency: '€' },
  };
}

describe('CountView', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('resumes straight into the count screen and shows the zero state once fully counted', () => {
    saveState(seedCountingSession());
    render(<App />);

    expect(screen.getByText('Count da chips')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Joe counted amount'), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText('Bruno counted amount'), { target: { value: '40' } });

    const splitButton = screen.getByRole('button', { name: 'View da split' });
    expect(splitButton).not.toBeDisabled();
    expect(screen.getByText('€0')).toBeInTheDocument();
  });

  it('keeps the split locked at zero remaining while a player is uncounted', () => {
    saveState(seedCountingSession());
    render(<App />);

    fireEvent.change(screen.getByLabelText('Joe counted amount'), { target: { value: '100' } });

    expect(screen.getByText('€0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1 player not counted yet' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Bruno counted amount'), { target: { value: '0' } });
    expect(screen.getByRole('button', { name: 'View da split' })).not.toBeDisabled();
  });

  it('shows the red danger state and a disabled split button when over-counted', () => {
    saveState(seedCountingSession());
    render(<App />);

    fireEvent.change(screen.getByLabelText('Joe counted amount'), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText('Bruno counted amount'), { target: { value: '55' } });

    expect(screen.getByText('-€15')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /too many counted/i })).toBeDisabled();
  });

  it('shows an inline error state instead of NaN for an unparseable amount', () => {
    saveState(seedCountingSession());
    render(<App />);

    const input = screen.getByLabelText('Joe counted amount');
    fireEvent.change(input, { target: { value: 'abc' } });

    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
