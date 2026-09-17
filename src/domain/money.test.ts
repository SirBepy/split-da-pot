import { describe, expect, it } from 'vitest';
import { formatCents, parseAmountToCents } from './money';

describe('parseAmountToCents', () => {
  it('parses whole numbers', () => {
    expect(parseAmountToCents('20')).toBe(2000);
  });

  it('parses a dot decimal', () => {
    expect(parseAmountToCents('20.5')).toBe(2050);
  });

  it('parses a comma decimal (Croatian input)', () => {
    expect(parseAmountToCents('12,50')).toBe(1250);
  });

  it('trims surrounding whitespace', () => {
    expect(parseAmountToCents('  20  ')).toBe(2000);
  });

  it('rejects garbage', () => {
    expect(parseAmountToCents('abc')).toBeNull();
  });

  it('rejects negatives', () => {
    expect(parseAmountToCents('-5')).toBeNull();
  });

  it('rejects an empty string', () => {
    expect(parseAmountToCents('')).toBeNull();
  });
});

describe('formatCents', () => {
  it('formats whole euros without decimals', () => {
    expect(formatCents(2000, '€')).toBe('€20');
  });

  it('formats fractional euros with two decimals', () => {
    expect(formatCents(2050, '€')).toBe('€20.50');
  });

  it('formats negative amounts with a leading minus', () => {
    expect(formatCents(-1500, '€')).toBe('-€15');
  });
});
