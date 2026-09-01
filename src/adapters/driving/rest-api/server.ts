import express, { Express } from 'express';
import { TaskController } from './task.controller.js';
import { createTaskRoutes } from './task.routes.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Driving / Inbound Adapter -> Express App Factory
 * ============================================================================
 * 
 * Factory function creating an Express app instance with injected dependencies.
 * Perfect for both running the real server AND testing with Supertest!
 */
export function createExpressApp(controller: TaskController): Express {
  const app = express();

  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Task API routes
  app.use('/api/tasks', createTaskRoutes(controller));

  return app;
}
