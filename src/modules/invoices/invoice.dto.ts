import { z } from 'zod';
import { formatDate } from '../../shared/dates';

const invoiceLineSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().int().min(1).max(10_000),
  unitPriceCents: z.number().int().min(0).max(1_000_000_000),
});

export const createInvoiceSchema = z.object({
  clientId: z.uuid(),
  dueDate: z.iso.date(),
  lines: z.array(invoiceLineSchema).min(1).max(100),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type InvoiceLineInput = z.infer<typeof invoiceLineSchema>;

/** An invoice as read from the database (dates are Date objects). */
export interface InvoiceRecord {
  id: string;
  number: string;
  client: { id: string; name: string; email: string };
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  totalCents: number;
  lines: InvoiceLineInput[];
}

/** An invoice as the API returns it: dates are YYYY-MM-DD strings. */
export function toInvoiceResponse(invoice: InvoiceRecord) {
  return {
    id: invoice.id,
    number: invoice.number,
    client: invoice.client,
    issueDate: formatDate(invoice.issueDate),
    dueDate: formatDate(invoice.dueDate),
    status: invoice.status,
    lines: invoice.lines.map(({ description, quantity, unitPriceCents }) => ({
      description,
      quantity,
      unitPriceCents,
    })),
    totalCents: invoice.totalCents,
  };
}
