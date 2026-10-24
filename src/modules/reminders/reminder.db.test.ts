import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { todayISO } from '../../shared/dates';
import { prisma } from '../../shared/db';
import { clientService } from '../clients/client.service';
import { invoiceService } from '../invoices/invoice.service';
import { reminderService } from './reminder.service';

// These tests need a real PostgreSQL with the migrations applied. They run in CI
// (RUN_DB_TESTS=true) and are skipped otherwise, so `npm test` works without a database.
const enabled = process.env.RUN_DB_TESTS === 'true';

function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

describe.skipIf(!enabled)('with a real database', () => {
  const today = todayISO();
  const tomorrow = addDays(today, 1);
  const dayAfter = addDays(today, 2);
  const lines = [{ description: 'Design', quantity: 3, unitPriceCents: 1999 }];

  async function newClient() {
    return clientService.create({
      name: 'Ada Lovelace',
      email: `ada-${crypto.randomUUID()}@example.com`,
    });
  }

  async function sentInvoiceDueToday() {
    const client = await newClient();
    const invoice = await invoiceService.create({ clientId: client.id, dueDate: today, lines });
    await invoiceService.send(invoice.id);
    return invoice;
  }

  beforeEach(async () => {
    await prisma.reminder.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.invoiceLine.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.client.deleteMany();
    await prisma.sequence.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('stores the total as whole cents', async () => {
    const client = await newClient();
    const invoice = await invoiceService.create({ clientId: client.id, dueDate: today, lines });

    expect(invoice.totalCents).toBe(5997);
    expect(invoice.number).toBe('FAC-0001');
  });

  it('records one reminder, and none when the check runs again the same day', async () => {
    await sentInvoiceDueToday();

    const first = await reminderService.runOverdueCheck(tomorrow);
    const second = await reminderService.runOverdueCheck(tomorrow);

    expect(first).toEqual({ overdue: 1, remindersCreated: 1 });
    expect(second).toEqual({ overdue: 1, remindersCreated: 0 });
    expect(await prisma.reminder.count()).toBe(1);
  });

  it('records one reminder when two runs overlap', async () => {
    await sentInvoiceDueToday();

    const results = await Promise.all([
      reminderService.runOverdueCheck(tomorrow),
      reminderService.runOverdueCheck(tomorrow),
    ]);

    expect(results.reduce((sum, r) => sum + r.remindersCreated, 0)).toBe(1);
    expect(await prisma.reminder.count()).toBe(1);
  });

  it('records a new reminder the next day, and stops once the invoice is paid', async () => {
    const invoice = await sentInvoiceDueToday();

    await reminderService.runOverdueCheck(tomorrow);
    const nextDay = await reminderService.runOverdueCheck(dayAfter);
    await invoiceService.pay(invoice.id);
    const afterPayment = await reminderService.runOverdueCheck(addDays(today, 3));

    expect(nextDay.remindersCreated).toBe(1);
    expect(afterPayment).toEqual({ overdue: 0, remindersCreated: 0 });
    expect(await prisma.reminder.count()).toBe(2);
  });

  it('gives every invoice a different number when they are created at the same time', async () => {
    const client = await newClient();

    const invoices = await Promise.all(
      Array.from({ length: 5 }, () =>
        invoiceService.create({ clientId: client.id, dueDate: today, lines }),
      ),
    );

    expect(invoices.map((i) => i.number).sort()).toEqual([
      'FAC-0001',
      'FAC-0002',
      'FAC-0003',
      'FAC-0004',
      'FAC-0005',
    ]);
  });
});
