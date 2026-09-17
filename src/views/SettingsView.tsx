import { CaretLeft } from '@phosphor-icons/react';
import { RosterList } from '../components/RosterList';
import { useApp } from '../state/AppContext';

export function SettingsView() {
  const { state, dispatch, goHome } = useApp();

  return (
    <div className="screen">
      <div className="screen-header">
        <div className="top-bar">
          <button type="button" className="icon-btn" aria-label="Back" onClick={goHome}>
            <CaretLeft size={20} />
          </button>
          <p className="display screen-header__title--small">Settings</p>
        </div>
      </div>
      <div className="screen-body">
        <div>
          <label className="field-label" htmlFor="currency-symbol">
            Currency symbol
          </label>
          <input
            id="currency-symbol"
            className="text-input"
            style={{ marginTop: 6, maxWidth: 120 }}
            value={state.settings.currency}
            onChange={(event) => dispatch({ type: 'UPDATE_SETTINGS', currency: event.target.value })}
          />
        </div>

        <h2 className="dim" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 8 }}>
          Roster
        </h2>
        <RosterList mode="manage" />

        <p className="dim" style={{ fontSize: 13, marginTop: 16 }}>
          Split Da Pot: a host-side pot tracker. No accounts, no cloud, just chips and friends.
        </p>
      </div>
    </div>
  );
}
