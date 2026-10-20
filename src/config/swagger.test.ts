import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../app';

vi.mock('../modules/clients/client.repository', () => ({
  clientRepository: { create: vi.fn() },
}));

const app = createApp();

describe('Swagger documentation', () => {
  it('serves an OpenAPI document that includes the routes documented in *.routes.ts', async () => {
    const res = await request(app).get('/docs.json');

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.paths['/clients'].post.summary).toBe('Create a client');
    expect(res.body.components.schemas).toHaveProperty('Client');
    expect(res.body.components.schemas).toHaveProperty('Error');
  });

  it('serves the Swagger UI page on /docs', async () => {
    const res = await request(app).get('/docs/');

    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger-ui');
  });
});
