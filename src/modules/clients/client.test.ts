import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../../app';

vi.mock('./client.repository', () => ({
  clientRepository: {
    create: vi.fn(async (data: { name: string; email: string }) => ({ id: 'client-1', ...data })),
  },
}));

const app = createApp();

describe('POST /api/clients', () => {
  it('creates a client and returns id, name and email', async () => {
    const res = await request(app)
      .post('/api/clients')
      .send({ name: '  Ada Lovelace ', email: 'Ada@Example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 'client-1', name: 'Ada Lovelace', email: 'ada@example.com' });
  });

  it('rejects an invalid email with a 400 and a message', async () => {
    const res = await request(app)
      .post('/api/clients')
      .send({ name: 'Ada', email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('email');
  });

  it('rejects a missing body with a 400', async () => {
    const res = await request(app).post('/api/clients');

    expect(res.status).toBe(400);
    expect(typeof res.body.message).toBe('string');
  });

  it('rejects malformed JSON with a 400', async () => {
    const res = await request(app)
      .post('/api/clients')
      .set('Content-Type', 'application/json')
      .send('{ "name": ');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Invalid request' });
  });
});

describe('unknown routes', () => {
  it('returns a 404 with a message', async () => {
    const res = await request(app).get('/nope');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Route not found' });
  });
});
