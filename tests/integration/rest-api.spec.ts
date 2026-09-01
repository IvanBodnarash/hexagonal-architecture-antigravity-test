import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { AppContainer } from '../../src/container/app-container.js';

describe('Driving Adapter: Express REST API (Integration)', () => {
  const container = new AppContainer({
    storageType: 'in-memory',
    enableConsoleNotifications: false,
  });

  const app = container.expressApp;

  it('GET /health - should return healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  it('POST /api/tasks - should create a task via HTTP REST', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Learn AI Agent Architecture',
        prompt: 'Explain why Hexagonal Architecture is great for AI Agent tool calling',
        priority: 'CRITICAL',
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.title).toBe('Learn AI Agent Architecture');
    expect(res.body.status).toBe('PENDING');
    expect(res.body.priority).toBe('CRITICAL');
  });

  it('POST /api/tasks/:id/execute - should execute the task via HTTP', async () => {
    // 1. Create task
    const createRes = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Write SQL migration',
        prompt: 'Create table for user profiles with JSON metadata',
      });

    const taskId = createRes.body.id;

    // 2. Execute task
    const executeRes = await request(app)
      .post(`/api/tasks/${taskId}/execute`)
      .send({ modelOverride: 'gemini-2.5-flash-simulated' });

    expect(executeRes.status).toBe(200);
    expect(executeRes.body.status).toBe('COMPLETED');
    expect(executeRes.body.result).toBeDefined();
    expect(executeRes.body.tokensUsed).toBeGreaterThan(0);
  });

  it('GET /api/tasks/:id - should return 404 for non-existent task', async () => {
    const res = await request(app).get('/api/tasks/00000000-0000-4000-8000-000000000000');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Not Found');
  });
});
