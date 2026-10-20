import { describe, expect, it } from 'vitest';
import { formatDate, toDateOnly, todayISO } from './dates';

describe('todayISO', () => {
  it('uses the Benin calendar day (UTC+1), not the UTC day', () => {
    // 23:30 UTC on the 19th is already 00:30 on the 20th in Benin
    expect(todayISO(new Date('2026-10-19T23:30:00Z'))).toBe('2026-10-20');
  });

  it('keeps the same day when UTC and Benin agree', () => {
    expect(todayISO(new Date('2026-10-20T08:00:00Z'))).toBe('2026-10-20');
  });
});

describe('toDateOnly and formatDate', () => {
  it('round-trips a calendar date without any timezone shift', () => {
    expect(formatDate(toDateOnly('2026-12-31'))).toBe('2026-12-31');
    expect(toDateOnly('2026-12-31').toISOString()).toBe('2026-12-31T00:00:00.000Z');
  });
});
