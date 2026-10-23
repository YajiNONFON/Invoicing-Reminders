import type { Request, Response } from 'express';
import { toReminderResponse } from './reminder.dto';
import { reminderService } from './reminder.service';

export const reminderController = {
  async list(_req: Request, res: Response) {
    const reminders = await reminderService.list();
    res.json(reminders.map(toReminderResponse));
  },
};
