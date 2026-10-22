import { describe, expect, it } from 'vitest';
import { formatCents } from './invoice.money';

describe('formatCents', () => {
  it.each([
    [0, '0.00'],
    [5, '0.05'],
    [100, '1.00'],
    [1999, '19.99'],
    [5997, '59.97'],
    [6998, '69.98'],
    [100_000_00, '100,000.00'],
    [2_147_483_647, '21,474,836.47'],
    [-250, '-2.50'],
  ])('formats %i cents as %s', (cents, expected) => {
    expect(formatCents(cents)).toBe(expected);
  });
});
