import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app';
import { renderInvoicePdf } from './invoice.pdf';

const { ID } = vi.hoisted(() => ({ ID: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' }));

const invoice = {
  id: ID,
  number: 'FAC-0001',
  client: { id: 'c1', name: 'Ada Lovelace', email: 'ada@example.com' },
  issueDate: new Date('2026-10-20T00:00:00.000Z'),
  dueDate: new Date('2026-11-19T00:00:00.000Z'),
  status: 'sent' as const,
  totalCents: 6998,
  lines: [
    { description: 'Design', quantity: 3, unitPriceCents: 1999 },
    { description: 'Hosting', quantity: 1, unitPriceCents: 1001 },
  ],
};

vi.mock('../clients/client.repository', () => ({ clientRepository: {} }));
vi.mock('./invoice.repository', () => ({
  invoiceRepository: { findById: vi.fn(async (id: string) => (id === ID ? invoice : null)) },
}));

const app = createApp();

describe('GET /api/invoices/:id/pdf', () => {
  it('returns a PDF file named after the invoice number', async () => {
    const res = await request(app)
      .get(`/api/invoices/${ID}/pdf`)
      .buffer(true)
      .parse((response, callback) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => chunks.push(chunk));
        response.on('end', () => callback(null, Buffer.concat(chunks)));
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toBe('inline; filename="FAC-0001.pdf"');
    expect((res.body as Buffer).subarray(0, 5).toString()).toBe('%PDF-');
  });

  it('returns 404 for an unknown invoice', async () => {
    const res = await request(app).get('/api/invoices/11111111-1111-4111-8111-111111111111/pdf');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Invoice not found' });
  });

  it('returns 400 for an invalid id', async () => {
    const res = await request(app).get('/api/invoices/abc/pdf');

    expect(res.status).toBe(400);
  });
});

describe('renderInvoicePdf', () => {
  it('handles an invoice with many lines by adding pages', async () => {
    const lines = Array.from({ length: 80 }, (_, i) => ({
      description: `Line item number ${i + 1}`,
      quantity: 1,
      unitPriceCents: 100,
    }));
    const pdf = await renderInvoicePdf({ ...invoice, lines, totalCents: 8000 });
    const pages = pdf.toString('latin1').match(/\/Type \/Page\b/g) ?? [];

    expect(pages.length).toBeGreaterThan(1);
  });
});
