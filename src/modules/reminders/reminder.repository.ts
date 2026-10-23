import { prisma } from '../../shared/db';

interface NewReminder {
  invoiceId: string;
  day: Date;
  subject: string;
}

export const reminderRepository = {
  /**
   * Inserts the reminders and silently skips the ones that already exist for the same
   * (invoice, day). The unique constraint in the database makes this safe even when two runs
   * overlap. Returns how many reminders were really created.
   */
  async createMany(data: NewReminder[]) {
    const { count } = await prisma.reminder.createMany({ data, skipDuplicates: true });
    return count;
  },

  findAll() {
    return prisma.reminder.findMany({
      orderBy: [{ day: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        invoiceId: true,
        day: true,
        subject: true,
        invoice: { select: { number: true, client: { select: { email: true } } } },
      },
    });
  },
};
