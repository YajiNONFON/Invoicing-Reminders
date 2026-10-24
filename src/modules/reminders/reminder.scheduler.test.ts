import { schedule, validate } from 'node-cron';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { runScheduledOverdueCheck, startScheduler } from './reminder.scheduler';
import { reminderService } from './reminder.service';

vi.mock('node-cron', () => ({
  schedule: vi.fn(() => ({ stop: vi.fn() })),
  validate: vi.fn(() => true),
}));

vi.mock('./reminder.service', () => ({
  reminderService: { runOverdueCheck: vi.fn() },
}));

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.mocked(schedule).mockClear();
  vi.mocked(validate).mockReturnValue(true);
});

describe('startScheduler', () => {
  it('schedules the check every day at 08:00 in the application timezone', () => {
    startScheduler();

    expect(schedule).toHaveBeenCalledWith('0 8 * * *', runScheduledOverdueCheck, {
      timezone: 'Africa/Porto-Novo',
    });
  });

  it('uses OVERDUE_CRON when it is set (handy for a demo)', () => {
    vi.stubEnv('OVERDUE_CRON', '* * * * *');
    startScheduler();

    expect(schedule).toHaveBeenCalledWith('* * * * *', runScheduledOverdueCheck, {
      timezone: 'Africa/Porto-Novo',
    });
  });

  it('refuses an invalid schedule at startup', () => {
    vi.stubEnv('OVERDUE_CRON', 'every day');
    vi.mocked(validate).mockReturnValue(false);

    expect(() => startScheduler()).toThrow('OVERDUE_CRON is not a valid cron expression');
    expect(schedule).not.toHaveBeenCalled();
  });
});

describe('runScheduledOverdueCheck', () => {
  it('runs the overdue check for today', async () => {
    vi.mocked(reminderService.runOverdueCheck).mockResolvedValue({
      overdue: 2,
      remindersCreated: 2,
    });

    await runScheduledOverdueCheck();

    expect(reminderService.runOverdueCheck).toHaveBeenCalledWith(
      expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    );
  });

  it('logs a failure instead of throwing, so the next day still runs', async () => {
    vi.mocked(reminderService.runOverdueCheck).mockRejectedValue(new Error('db down'));

    await expect(runScheduledOverdueCheck()).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });
});
