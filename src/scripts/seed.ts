import { toDateOnly, todayISO } from '../shared/dates';
import { prisma } from '../shared/db';
import { clientRepository } from '../modules/clients/client.repository';
import type { InvoiceLineInput } from '../modules/invoices/invoice.dto';
import { invoiceRepository } from '../modules/invoices/invoice.repository';
import { computeTotalCents } from '../modules/invoices/invoice.service';

/**
 * Fills the database with demo data. It deletes everything first, so it refuses to run in
 * production. Run it with `npm run seed`.
 */

function addDays(iso: string, days: number): string {
  const date = toDateOnly(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The seed deletes all data and must not run in production');
  }

  await prisma.reminder.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.client.deleteMany();
  await prisma.sequence.deleteMany();

  const today = todayISO();

  const afi = await clientRepository.create({
    name: 'Afi Mensah',
    email: 'afi.mensah@example.com',
  });
  const koffi = await clientRepository.create({
    name: 'Koffi Agbodjan',
    email: 'koffi.agbodjan@example.com',
  });
  const boutique = await clientRepository.create({
    name: 'Boutique Soleil',
    email: 'contact@boutique-soleil.example.com',
  });

  // Goes through the same repository as the API (numbering, total), but with chosen dates so the
  // demo can contain invoices that are already late, which the API itself refuses to create.
  async function createInvoice(
    clientId: string,
    dueInDays: number,
    lines: InvoiceLineInput[],
    finalStatus: 'draft' | 'sent' | 'paid',
  ) {
    const dueDate = addDays(today, dueInDays);
    const invoice = await invoiceRepository.create({
      clientId,
      issueDate: toDateOnly(addDays(dueDate, -30)),
      dueDate: toDateOnly(dueDate),
      totalCents: computeTotalCents(lines),
      lines,
    });
    if (finalStatus !== 'draft') {
      await invoiceRepository.transition(invoice.id, ['draft'], 'sent');
    }
    if (finalStatus === 'paid') {
      await invoiceRepository.pay(invoice.id, ['sent'], invoice.totalCents, new Date());
    }
    return invoice;
  }

  const invoices = [
    await createInvoice(
      afi.id,
      30,
      [
        { description: 'Website design', quantity: 1, unitPriceCents: 240000 },
        { description: 'Hosting (12 months)', quantity: 12, unitPriceCents: 2000 },
      ],
      'sent',
    ),
    await createInvoice(
      koffi.id,
      -5,
      [
        { description: 'Monthly maintenance', quantity: 3, unitPriceCents: 49900 },
        { description: 'Domain name', quantity: 1, unitPriceCents: 1500 },
      ],
      'sent',
    ),
    await createInvoice(
      boutique.id,
      -12,
      [{ description: 'Product photos', quantity: 20, unitPriceCents: 4500 }],
      'sent',
    ),
    await createInvoice(
      afi.id,
      14,
      [{ description: 'Logo redesign', quantity: 1, unitPriceCents: 85000 }],
      'draft',
    ),
    await createInvoice(
      koffi.id,
      -20,
      [{ description: 'SEO audit', quantity: 1, unitPriceCents: 180000 }],
      'paid',
    ),
  ];

  console.log(`Seeded ${invoices.length} invoices for 3 clients:`);
  for (const invoice of invoices) {
    console.log(`  ${invoice.number}  ${invoice.client.name}`);
  }
  console.log(
    '\nFAC-0002 and FAC-0003 are sent and already past their due date.\n' +
      'The next overdue check flags them and records a reminder for each:\n' +
      '  - wait for the schedule (see OVERDUE_CRON), or\n' +
      '  - call POST /api/jobs/overdue-check',
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
