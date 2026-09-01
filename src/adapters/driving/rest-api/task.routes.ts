import { Router } from 'express';
import { TaskController } from './task.controller.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Driving / Inbound Adapter -> Routes (OUTSIDE THE HEXAGON)
 * ============================================================================
 */
export function createTaskRoutes(controller: TaskController): Router {
  const router = Router();

  router.post('/', controller.createTask);
  router.get('/', controller.listTasks);
  router.get('/:id', controller.getTask);
  router.post('/:id/execute', controller.executeTask);

  return router;
}
