import { describe, expect, it } from 'vitest';
import { computeTotalCents } from './invoice.service';

describe('computeTotalCents', () => {
  it('sums quantity x unit price over every line, in whole cents', () => {
    const total = computeTotalCents([
      { description: 'Design', quantity: 3, unitPriceCents: 1999 },
      { description: 'Hosting', quantity: 1, unitPriceCents: 1001 },
    ]);

    expect(total).toBe(6998);
  });

  it('stays exact where decimal arithmetic drifts', () => {
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(
      computeTotalCents([
        { description: 'a', quantity: 1, unitPriceCents: 10 },
        { description: 'b', quantity: 1, unitPriceCents: 20 },
      ]),
    ).toBe(30);
  });

  it('returns 0 for free items', () => {
    expect(computeTotalCents([{ description: 'Free', quantity: 5, unitPriceCents: 0 }])).toBe(0);
  });
});
