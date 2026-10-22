export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

/** The only allowed status changes. Anything else is rejected. */
const ALLOWED_TRANSITIONS: Record<InvoiceStatus, readonly InvoiceStatus[]> = {
  draft: ['sent'],
  sent: ['paid', 'overdue'],
  overdue: ['paid'],
  paid: [],
};

export function canTransition(from: InvoiceStatus, to: InvoiceStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Statuses an invoice may be in when it moves to `to`. */
export function statusesBefore(to: InvoiceStatus): InvoiceStatus[] {
  return (Object.keys(ALLOWED_TRANSITIONS) as InvoiceStatus[]).filter((from) =>
    canTransition(from, to),
  );
}
