import { useState } from 'react';
import { parseAmountToCents } from '../domain/money';

interface AmountEntryProps {
  currency: string;
  submitLabel: string;
  presets?: number[];
  onSubmit: (amountCents: number) => void;
  submitVariant?: 'primary' | 'danger';
}

const DEFAULT_PRESETS = [500, 1000, 2000, 5000];

/** "550" -> "5.5"; keeps the field editable in the same units parseAmountToCents expects. */
export function centsToInputValue(cents: number): string {
  const value = cents / 100;
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

export function AmountEntry({
  currency,
  submitLabel,
  presets = DEFAULT_PRESETS,
  onSubmit,
  submitVariant = 'primary',
}: AmountEntryProps) {
  const [raw, setRaw] = useState('');
  const parsed = parseAmountToCents(raw);
  const showError = raw.trim() !== '' && parsed === null;

  function applyPreset(presetCents: number) {
    const base = parsed ?? 0;
    setRaw(centsToInputValue(base + presetCents));
  }

  function submit() {
    if (parsed === null || parsed <= 0) return;
    onSubmit(parsed);
    setRaw('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="chip-row">
        {presets.map((preset) => (
          <button key={preset} type="button" className="btn-chip btn-chip--ghost" onClick={() => applyPreset(preset)}>
            +{currency}
            {preset / 100}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <input
            className={`text-input ${showError ? 'text-input--error' : ''}`}
            inputMode="decimal"
            placeholder={`${currency}0`}
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            aria-invalid={showError}
          />
          {showError && (
            <p className="danger-text" style={{ fontSize: 12, marginTop: 4 }}>
              Not a valid amount
            </p>
          )}
        </div>
        <button
          type="button"
          className={`btn ${submitVariant === 'primary' ? 'btn-primary' : 'btn-danger-outline'}`}
          onClick={submit}
          disabled={parsed === null || parsed <= 0}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
