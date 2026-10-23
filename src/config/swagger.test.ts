import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app';

const app = createApp();

describe('Swagger documentation', () => {
  it('serves an OpenAPI document that includes the routes documented in *.routes.ts', async () => {
    const res = await request(app).get('/docs.json');

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.paths['/clients'].post.summary).toBe('Create a client');
    expect(res.body.paths['/invoices'].post.summary).toBe('Create an invoice');
    expect(res.body.paths['/invoices'].get.summary).toBe('List invoices');
    expect(res.body.paths['/invoices/{id}'].get).toBeDefined();
    expect(res.body.paths['/invoices/{id}/send'].post).toBeDefined();
    expect(res.body.paths['/invoices/{id}/pay'].post).toBeDefined();
    expect(res.body.paths['/invoices/{id}/pdf'].get).toBeDefined();
    expect(res.body.paths['/reminders'].get).toBeDefined();
    expect(res.body.paths['/jobs/overdue-check'].post).toBeDefined();
    expect(res.body.components.schemas).toHaveProperty('Client');
    expect(res.body.components.schemas).toHaveProperty('Invoice');
    expect(res.body.components.schemas).toHaveProperty('Error');
  });

  it('serves the Swagger UI page on /docs', async () => {
    const res = await request(app).get('/docs/');

    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger-ui');
  });
});
