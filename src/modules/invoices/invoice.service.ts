import { toDateOnly, todayISO } from '../../shared/dates';
import { badRequest, conflict, notFound } from '../../shared/errors';
import { clientService } from '../clients/client.service';
import type { CreateInvoiceInput, InvoiceLineInput } from './invoice.dto';
import { invoiceRepository } from './invoice.repository';
import { statusesBefore } from './invoice.status';

// Largest value a PostgreSQL integer column can hold
const MAX_TOTAL_CENTS = 2_147_483_647;

export function computeTotalCents(lines: InvoiceLineInput[]): number {
  return lines.reduce((total, line) => total + line.quantity * line.unitPriceCents, 0);
}

export const invoiceService = {
  async create(input: CreateInvoiceInput) {
    await clientService.getById(input.clientId);

    const issueDate = todayISO();
    if (input.dueDate < issueDate) {
      throw badRequest('dueDate must not be before the issue date');
    }

    const totalCents = computeTotalCents(input.lines);
    if (totalCents > MAX_TOTAL_CENTS) {
      throw badRequest('Invoice total is too large');
    }

    return invoiceRepository.create({
      clientId: input.clientId,
      issueDate: toDateOnly(issueDate),
      dueDate: toDateOnly(input.dueDate),
      totalCents,
      lines: input.lines,
    });
  },

  list() {
    return invoiceRepository.findAll();
  },

  async getById(id: string) {
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) {
      throw notFound('Invoice not found');
    }
    return invoice;
  },

  async send(id: string) {
    const invoice = await this.getById(id);
    const moved = await invoiceRepository.transition(id, statusesBefore('sent'), 'sent');
    if (!moved) {
      throw conflict(`Cannot send an invoice that is ${invoice.status}`);
    }
    return this.getById(id);
  },

  async pay(id: string) {
    const invoice = await this.getById(id);
    const moved = await invoiceRepository.pay(
      id,
      statusesBefore('paid'),
      invoice.totalCents,
      new Date(),
    );
    if (!moved) {
      throw conflict(`Cannot pay an invoice that is ${invoice.status}`);
    }
    return this.getById(id);
  },
};
