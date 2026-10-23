import { z } from 'zod';
import { formatDate } from '../../shared/dates';

export const overdueCheckSchema = z.object({ today: z.iso.date().optional() });

export interface ReminderRecord {
  id: string;
  invoiceId: string;
  day: Date;
  subject: string;
  invoice: { number: string; client: { email: string } };
}

export function toReminderResponse(reminder: ReminderRecord) {
  return {
    id: reminder.id,
    invoiceId: reminder.invoiceId,
    number: reminder.invoice.number,
    to: reminder.invoice.client.email,
    date: formatDate(reminder.day),
    subject: reminder.subject,
  };
}
