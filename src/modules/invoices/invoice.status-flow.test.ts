import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app';
import type { InvoiceStatus } from './invoice.status';

const { ID, state } = vi.hoisted(() => ({
  ID: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
  state: { status: 'draft' as string, payments: [] as number[] },
}));

vi.mock('../clients/client.repository', () => ({ clientRepository: {} }));

vi.mock('./invoice.repository', () => ({
  invoiceRepository: {
    findById: vi.fn(async (id: string) =>
      id === ID
        ? {
            id: ID,
            number: 'FAC-0001',
            client: { id: 'c1', name: 'Ada', email: 'ada@example.com' },
            issueDate: new Date('2026-10-20T00:00:00.000Z'),
            dueDate: new Date('2026-11-19T00:00:00.000Z'),
            status: state.status,
            totalCents: 6998,
            lines: [],
          }
        : null,
    ),
    // Same rule as the real guarded UPDATE: only moves when the current status is allowed
    transition: vi.fn(async (_id: string, from: string[], to: string) => {
      if (!from.includes(state.status)) return false;
      state.status = to;
      return true;
    }),
    pay: vi.fn(async (_id: string, from: string[], amountCents: number) => {
      if (!from.includes(state.status)) return false;
      state.status = 'paid';
      state.payments.push(amountCents);
      return true;
    }),
  },
}));

const app = createApp();

beforeEach(() => {
  state.status = 'draft';
  state.payments = [];
});

const at = (status: InvoiceStatus) => {
  state.status = status;
};

describe('POST /api/invoices/:id/send', () => {
  it('moves a draft to sent', async () => {
    const res = await request(app).post(`/api/invoices/${ID}/send`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('sent');
  });

  for (const status of ['sent', 'paid', 'overdue'] as const) {
    it(`rejects an invoice that is ${status} with 409`, async () => {
      at(status);
      const res = await request(app).post(`/api/invoices/${ID}/send`);

      expect(res.status).toBe(409);
      expect(res.body).toEqual({ message: `Cannot send an invoice that is ${status}` });
      expect(state.status).toBe(status);
    });
  }

  it('returns 404 for an unknown invoice', async () => {
    const res = await request(app).post('/api/invoices/11111111-1111-4111-8111-111111111111/send');
    expect(res.status).toBe(404);
  });

  it('returns 400 for an invalid id', async () => {
    const res = await request(app).post('/api/invoices/abc/send');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/invoices/:id/pay', () => {
  for (const status of ['sent', 'overdue'] as const) {
    it(`pays an invoice that is ${status} and records the full total`, async () => {
      at(status);
      const res = await request(app).post(`/api/invoices/${ID}/pay`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('paid');
      expect(state.payments).toEqual([6998]);
    });
  }

  for (const status of ['draft', 'paid'] as const) {
    it(`rejects an invoice that is ${status} with 409 and records nothing`, async () => {
      at(status);
      const res = await request(app).post(`/api/invoices/${ID}/pay`);

      expect(res.status).toBe(409);
      expect(res.body).toEqual({ message: `Cannot pay an invoice that is ${status}` });
      expect(state.payments).toEqual([]);
    });
  }

  it('cannot be paid twice', async () => {
    at('sent');
    await request(app).post(`/api/invoices/${ID}/pay`);
    const second = await request(app).post(`/api/invoices/${ID}/pay`);

    expect(second.status).toBe(409);
    expect(state.payments).toEqual([6998]);
  });
});
