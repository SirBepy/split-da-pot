const AMOUNT_PATTERN = /^\d+([.,]\d+)?$/;

/**
 * Accepts "20", "20.5", "20,50" (Croatian comma decimal). Rejects
 * negatives, empty input, and anything non-numeric.
 */
export function parseAmountToCents(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === '' || !AMOUNT_PATTERN.test(trimmed)) {
    return null;
  }
  const value = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(value)) {
    return null;
  }
  return Math.round(value * 100);
}

/** "550" -> "5.5"; keeps the field editable in the same units parseAmountToCents expects. */
export function centsToInputValue(cents: number): string {
  const value = cents / 100;
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

export function formatCents(cents: number, currency: string): string {
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const fraction = abs % 100;
  const amount = fraction === 0 ? `${whole}` : `${whole}.${String(fraction).padStart(2, '0')}`;
  return `${negative ? '-' : ''}${currency}${amount}`;
}
