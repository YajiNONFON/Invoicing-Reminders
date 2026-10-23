import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app';

const { CLIENT_ID, INVOICE_ID } = vi.hoisted(() => ({
  CLIENT_ID: '3f2a8c1e-5b7d-4e9a-8c2f-1a2b3c4d5e6f',
  INVOICE_ID: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
}));

vi.mock('../clients/client.repository', () => ({
  clientRepository: {
    create: vi.fn(),
    findById: vi.fn(async (id: string) =>
      id === CLIENT_ID ? { id, name: 'Ada Lovelace', email: 'ada@example.com' } : null,
    ),
  },
}));

const storedInvoice = {
  id: INVOICE_ID,
  number: 'FAC-0001',
  client: { id: CLIENT_ID, name: 'Ada Lovelace', email: 'ada@example.com' },
  issueDate: new Date('2026-10-20T00:00:00.000Z'),
  dueDate: new Date('2026-11-19T00:00:00.000Z'),
  status: 'draft',
  totalCents: 6998,
  lines: [
    { description: 'Design', quantity: 3, unitPriceCents: 1999 },
    { description: 'Hosting', quantity: 1, unitPriceCents: 1001 },
  ],
  reminders: [
    {
      id: 'r1',
      day: new Date('2026-10-23T00:00:00.000Z'),
      subject: 'Reminder: invoice FAC-0001 is overdue',
    },
  ],
};

vi.mock('./invoice.repository', () => ({
  invoiceRepository: {
    findAll: vi.fn(async () => [storedInvoice]),
    findById: vi.fn(async (id: string) => (id === INVOICE_ID ? storedInvoice : null)),
    create: vi.fn(async (data) => ({
      id: 'invoice-1',
      number: 'FAC-0001',
      client: { id: data.clientId, name: 'Ada Lovelace', email: 'ada@example.com' },
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      status: 'draft',
      totalCents: data.totalCents,
      lines: data.lines,
    })),
  },
}));

const app = createApp();

const validBody = {
  clientId: CLIENT_ID,
  dueDate: '2026-11-19',
  lines: [
    { description: 'Design', quantity: 3, unitPriceCents: 1999 },
    { description: 'Hosting', quantity: 1, unitPriceCents: 1001 },
  ],
};

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-20T08:00:00Z'));
});

afterAll(() => {
  vi.useRealTimers();
});

describe('POST /api/invoices', () => {
  it('creates a draft invoice and computes the total on the server', async () => {
    const res = await request(app)
      .post('/api/invoices')
      .send({ ...validBody, totalCents: 1 }); // a total sent by the client must be ignored

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: 'invoice-1',
      number: 'FAC-0001',
      client: { id: CLIENT_ID, name: 'Ada Lovelace', email: 'ada@example.com' },
      issueDate: '2026-10-20',
      dueDate: '2026-11-19',
      status: 'draft',
      lines: validBody.lines,
      totalCents: 6998,
    });
  });

  it('rejects an invoice without lines', async () => {
    const res = await request(app)
      .post('/api/invoices')
      .send({ ...validBody, lines: [] });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('lines');
  });

  it('rejects a decimal amount: money must be whole cents', async () => {
    const res = await request(app)
      .post('/api/invoices')
      .send({ ...validBody, lines: [{ description: 'x', quantity: 1, unitPriceCents: 19.99 }] });

    expect(res.status).toBe(400);
  });

  it('rejects an impossible date', async () => {
    const res = await request(app)
      .post('/api/invoices')
      .send({ ...validBody, dueDate: '2026-13-40' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('dueDate');
  });

  it('rejects a due date before the issue date', async () => {
    const res = await request(app)
      .post('/api/invoices')
      .send({ ...validBody, dueDate: '2026-10-19' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('dueDate must not be before the issue date');
  });

  it('accepts a due date equal to the issue date', async () => {
    const res = await request(app)
      .post('/api/invoices')
      .send({ ...validBody, dueDate: '2026-10-20' });

    expect(res.status).toBe(201);
  });

  it('returns 404 when the client does not exist', async () => {
    const res = await request(app)
      .post('/api/invoices')
      .send({ ...validBody, clientId: '11111111-1111-4111-8111-111111111111' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Client not found' });
  });

  it('rejects a total that does not fit in the database', async () => {
    const res = await request(app)
      .post('/api/invoices')
      .send({
        ...validBody,
        lines: [{ description: 'Huge', quantity: 10_000, unitPriceCents: 1_000_000_000 }],
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invoice total is too large');
  });
});

describe('GET /api/invoices', () => {
  it('lists invoices with dates as YYYY-MM-DD strings', async () => {
    const res = await request(app).get('/api/invoices');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      number: 'FAC-0001',
      issueDate: '2026-10-20',
      dueDate: '2026-11-19',
      totalCents: 6998,
    });
  });
});

describe('GET /api/invoices/:id', () => {
  it('returns the invoice with its reminders', async () => {
    const res = await request(app).get(`/api/invoices/${INVOICE_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(INVOICE_ID);
    expect(res.body.reminders).toEqual([
      {
        id: 'r1',
        invoiceId: INVOICE_ID,
        number: 'FAC-0001',
        to: 'ada@example.com',
        date: '2026-10-23',
        subject: 'Reminder: invoice FAC-0001 is overdue',
      },
    ]);
  });

  it('returns 404 for an unknown invoice', async () => {
    const res = await request(app).get('/api/invoices/11111111-1111-4111-8111-111111111111');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Invoice not found' });
  });

  it('returns 400 when the id is not a UUID', async () => {
    const res = await request(app).get('/api/invoices/abc');

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('id');
  });
});
