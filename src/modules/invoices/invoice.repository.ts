import { prisma } from '../../shared/db';
import type { InvoiceLineInput } from './invoice.dto';

const invoiceInclude = {
  client: { select: { id: true, name: true, email: true } },
  lines: {
    orderBy: { position: 'asc' },
    select: { description: true, quantity: true, unitPriceCents: true },
  },
} as const;

interface NewInvoice {
  clientId: string;
  issueDate: Date;
  dueDate: Date;
  totalCents: number;
  lines: InvoiceLineInput[];
}

export const invoiceRepository = {
  findAll() {
    return prisma.invoice.findMany({
      orderBy: [{ createdAt: 'desc' }, { number: 'desc' }],
      include: invoiceInclude,
    });
  },

  findById(id: string) {
    return prisma.invoice.findUnique({ where: { id }, include: invoiceInclude });
  },

  /** Reserves the next invoice number and inserts the invoice with its lines, atomically. */
  create(data: NewInvoice) {
    return prisma.$transaction(async (tx) => {
      const sequence = await tx.sequence.upsert({
        where: { name: 'invoice' },
        update: { value: { increment: 1 } },
        create: { name: 'invoice', value: 1 },
      });

      return tx.invoice.create({
        data: {
          number: `FAC-${String(sequence.value).padStart(4, '0')}`,
          clientId: data.clientId,
          issueDate: data.issueDate,
          dueDate: data.dueDate,
          totalCents: data.totalCents,
          lines: { create: data.lines.map((line, position) => ({ ...line, position })) },
        },
        include: invoiceInclude,
      });
    });
  },
};
