import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app';

const { state } = vi.hoisted(() => ({
  state: {
    invoices: [] as { id: string; number: string; dueDate: string; status: string }[],
    reminders: new Set<string>(),
  },
}));

// A fake invoice store with the same overdue rule as the real SQL update
vi.mock('../invoices/invoice.repository', () => ({
  invoiceRepository: {
    markOverdue: vi.fn(async (from: string[], today: Date) => {
      const limit = today.toISOString().slice(0, 10);
      let count = 0;
      for (const invoice of state.invoices) {
        if (from.includes(invoice.status) && invoice.dueDate < limit) {
          invoice.status = 'overdue';
          count++;
        }
      }
      return count;
    }),
    findOverdue: vi.fn(async (today: Date) => {
      const limit = today.toISOString().slice(0, 10);
      return state.invoices.filter((i) => i.status === 'overdue' && i.dueDate < limit);
    }),
  },
}));

// A fake reminder store that rejects duplicates like the (invoiceId, day) unique constraint
vi.mock('./reminder.repository', () => ({
  reminderRepository: {
    createMany: vi.fn(async (data: { invoiceId: string; day: Date }[]) => {
      let created = 0;
      for (const { invoiceId, day } of data) {
        const key = `${invoiceId}|${day.toISOString().slice(0, 10)}`;
        if (!state.reminders.has(key)) {
          state.reminders.add(key);
          created++;
        }
      }
      return created;
    }),
    findAll: vi.fn(async () => [
      {
        id: 'r1',
        invoiceId: 'i1',
        day: new Date('2026-10-23T00:00:00.000Z'),
        subject: 'Reminder: invoice FAC-0001 is overdue',
        invoice: { number: 'FAC-0001', client: { email: 'ada@example.com' } },
      },
    ]),
  },
}));

const app = createApp();

beforeEach(() => {
  state.reminders = new Set();
  state.invoices = [
    { id: 'i1', number: 'FAC-0001', dueDate: '2026-10-10', status: 'sent' },
    { id: 'i2', number: 'FAC-0002', dueDate: '2026-12-31', status: 'sent' },
    { id: 'i3', number: 'FAC-0003', dueDate: '2026-10-01', status: 'paid' },
    { id: 'i4', number: 'FAC-0004', dueDate: '2026-10-01', status: 'draft' },
  ];
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const check = (body?: object) => request(app).post('/api/jobs/overdue-check').send(body);

describe('POST /api/jobs/overdue-check', () => {
  it('flags the late sent invoice and records one reminder for it', async () => {
    const res = await check({ today: '2026-10-23' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ overdue: 1, remindersCreated: 1 });
    expect(state.invoices.map((i) => i.status)).toEqual(['overdue', 'sent', 'paid', 'draft']);
  });

  it('creates nothing new when run twice the same day', async () => {
    await check({ today: '2026-10-23' });
    const second = await check({ today: '2026-10-23' });

    expect(second.body).toEqual({ overdue: 1, remindersCreated: 0 });
    expect(state.reminders.size).toBe(1);
  });

  it('records a new reminder the next day while the invoice stays overdue', async () => {
    await check({ today: '2026-10-23' });
    const nextDay = await check({ today: '2026-10-24' });

    expect(nextDay.body).toEqual({ overdue: 1, remindersCreated: 1 });
    expect(state.reminders.size).toBe(2);
  });

  it('does not treat an invoice due today as overdue', async () => {
    const res = await check({ today: '2026-10-10' });

    expect(res.body).toEqual({ overdue: 0, remindersCreated: 0 });
  });

  it('stops reminding an invoice once it is paid', async () => {
    await check({ today: '2026-10-23' });
    state.invoices[0].status = 'paid';
    const nextDay = await check({ today: '2026-10-24' });

    expect(nextDay.body).toEqual({ overdue: 0, remindersCreated: 0 });
  });

  it('works without a body, using the server date', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-23T08:00:00Z'));
    try {
      const res = await check();

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ overdue: 1, remindersCreated: 1 });
    } finally {
      vi.useRealTimers();
    }
  });

  it('ignores the today override in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-05T08:00:00Z'));
    try {
      // Server date is before every due date, so the override (2026-10-23) must not apply
      const res = await check({ today: '2026-10-23' });

      expect(res.body).toEqual({ overdue: 0, remindersCreated: 0 });
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects an invalid date', async () => {
    const res = await check({ today: '2026-13-40' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('today');
  });
});

describe('GET /api/reminders', () => {
  it('lists reminders in the contract shape', async () => {
    const res = await request(app).get('/api/reminders');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        id: 'r1',
        invoiceId: 'i1',
        number: 'FAC-0001',
        to: 'ada@example.com',
        date: '2026-10-23',
        subject: 'Reminder: invoice FAC-0001 is overdue',
      },
    ]);
  });
});
