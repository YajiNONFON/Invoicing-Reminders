import { toDateOnly } from '../../shared/dates';
import { invoiceService } from '../invoices/invoice.service';
import { reminderRepository } from './reminder.repository';

export const reminderService = {
  list() {
    return reminderRepository.findAll();
  },

  /**
   * Flags overdue invoices and records one reminder for each of them for `today`.
   * Running it again the same day creates nothing new.
   */
  async runOverdueCheck(today: string) {
    const overdue = await invoiceService.markOverdue(today);
    if (overdue.length === 0) {
      return { overdue: 0, remindersCreated: 0 };
    }

    const day = toDateOnly(today);
    const remindersCreated = await reminderRepository.createMany(
      overdue.map((invoice) => ({
        invoiceId: invoice.id,
        day,
        subject: `Reminder: invoice ${invoice.number} is overdue`,
      })),
    );

    return { overdue: overdue.length, remindersCreated };
  },
};
