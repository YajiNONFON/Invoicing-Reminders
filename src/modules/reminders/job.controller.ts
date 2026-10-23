import type { Request, Response } from 'express';
import { todayISO } from '../../shared/dates';
import { overdueCheckSchema } from './reminder.dto';
import { reminderService } from './reminder.service';

export const jobController = {
  async overdueCheck(req: Request, res: Response) {
    const input = overdueCheckSchema.parse(req.body ?? {});
    // The date override exists for demos and tests only: in production the server date is used
    const allowOverride = process.env.NODE_ENV !== 'production';
    const today = allowOverride && input.today ? input.today : todayISO();

    res.json(await reminderService.runOverdueCheck(today));
  },
};
