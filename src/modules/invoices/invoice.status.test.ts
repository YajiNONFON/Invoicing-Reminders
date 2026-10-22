import { describe, expect, it } from 'vitest';
import { canTransition, statusesBefore, type InvoiceStatus } from './invoice.status';

const ALL: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue'];
const ALLOWED = new Set(['draft>sent', 'sent>paid', 'sent>overdue', 'overdue>paid']);

describe('canTransition', () => {
  for (const from of ALL) {
    for (const to of ALL) {
      const allowed = ALLOWED.has(`${from}>${to}`);
      it(`${from} to ${to} is ${allowed ? 'allowed' : 'rejected'}`, () => {
        expect(canTransition(from, to)).toBe(allowed);
      });
    }
  }
});

describe('statusesBefore', () => {
  it('lists where an invoice can be paid from', () => {
    expect(statusesBefore('paid').sort()).toEqual(['overdue', 'sent']);
  });

  it('lists where an invoice can be sent from', () => {
    expect(statusesBefore('sent')).toEqual(['draft']);
  });
});
