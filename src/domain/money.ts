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

export function formatCents(cents: number, currency: string): string {
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const fraction = abs % 100;
  const amount = fraction === 0 ? `${whole}` : `${whole}.${String(fraction).padStart(2, '0')}`;
  return `${negative ? '-' : ''}${currency}${amount}`;
}
