// tests/integration/health.test.js (ESM)
import request from 'supertest';
import app from '../../server.js';

describe('GET /health', () => {
  it('responds with ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
