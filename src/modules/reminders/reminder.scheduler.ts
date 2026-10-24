import { schedule, validate, type ScheduledTask } from 'node-cron';
import { APP_TIMEZONE, todayISO } from '../../shared/dates';
import { reminderService } from './reminder.service';

const DEFAULT_SCHEDULE = '0 8 * * *'; // every day at 08:00

/** Runs the overdue check, and never lets an error stop the scheduler. */
export async function runScheduledOverdueCheck() {
  try {
    const result = await reminderService.runOverdueCheck(todayISO());
    console.log(
      `[overdue-check] ${result.overdue} overdue, ${result.remindersCreated} reminders created`,
    );
  } catch (error) {
    console.error('[overdue-check] failed', error);
  }
}

/** Starts the daily overdue check. The schedule can be changed with OVERDUE_CRON. */
export function startScheduler(): ScheduledTask {
  const expression = process.env.OVERDUE_CRON ?? DEFAULT_SCHEDULE;
  if (!validate(expression)) {
    throw new Error(`OVERDUE_CRON is not a valid cron expression: ${expression}`);
  }

  console.log(`Scheduler: overdue check "${expression}" (${APP_TIMEZONE})`);
  return schedule(expression, runScheduledOverdueCheck, { timezone: APP_TIMEZONE });
}
