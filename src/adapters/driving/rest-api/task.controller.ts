import { Request, Response } from 'express';
import { z } from 'zod';
import { ICreateTaskUseCase } from '../../../core/ports/inbound/create-task.port.js';
import { IExecuteAITaskUseCase } from '../../../core/ports/inbound/execute-ai-task.port.js';
import { IGetTaskUseCase } from '../../../core/ports/inbound/get-task.port.js';
import { IListTasksUseCase } from '../../../core/ports/inbound/list-tasks.port.js';
import { DomainError, TaskNotFoundError, ValidationError, InvalidTaskStateTransitionError } from '../../../core/domain/errors/domain-errors.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Driving / Inbound Adapter -> Controller (OUTSIDE THE HEXAGON)
 * ============================================================================
 * 
 * WHAT IS THE ROLE OF THIS CONTROLLER?
 * 1. Receives HTTP Request (`req`, `res`) from Express.
 * 2. Validates incoming HTTP JSON payload (using Zod).
 * 3. Calls the INBOUND PORTS (Use Cases).
 * 4. Catches Domain Errors and maps them to HTTP Status Codes (400, 404, 500).
 * 5. Returns JSON response.
 * 
 * ⚠️ NOTICE: The Controller does NOT contain business logic!
 * It is purely a translator between HTTP and our Inbound Use Cases.
 */

// Zod schemas for HTTP request validation
const CreateTaskHttpSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  prompt: z.string().min(1, 'Prompt is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

const ExecuteTaskHttpSchema = z.object({
  modelOverride: z.string().optional(),
});

export class TaskController {
  constructor(
    private readonly createTaskUseCase: ICreateTaskUseCase,
    private readonly executeAITaskUseCase: IExecuteAITaskUseCase,
    private readonly getTaskUseCase: IGetTaskUseCase,
    private readonly listTasksUseCase: IListTasksUseCase
  ) {}

  /**
   * POST /api/tasks
   */
  public createTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const parsed = CreateTaskHttpSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation Error', details: parsed.error.format() });
        return;
      }

      const result = await this.createTaskUseCase.execute(parsed.data);
      res.status(201).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * POST /api/tasks/:id/execute
   */
  public executeTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const parsed = ExecuteTaskHttpSchema.safeParse(req.body || {});
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation Error', details: parsed.error.format() });
        return;
      }

      const result = await this.executeAITaskUseCase.execute({
        taskId: id,
        modelOverride: parsed.data.modelOverride,
      });

      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * GET /api/tasks/:id
   */
  public getTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.getTaskUseCase.execute({ taskId: id });
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * GET /api/tasks
   */
  public listTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, limit } = req.query;
      const result = await this.listTasksUseCase.execute({
        status: typeof status === 'string' ? status : undefined,
        limit: typeof limit === 'string' ? parseInt(limit, 10) : undefined,
      });
      res.status(200).json(result);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  /**
   * Translates Domain Errors into clean HTTP Responses
   */
  private handleError(error: unknown, res: Response): void {
    if (error instanceof TaskNotFoundError) {
      res.status(404).json({ error: 'Not Found', message: error.message });
      return;
    }

    if (error instanceof ValidationError || error instanceof InvalidTaskStateTransitionError) {
      res.status(400).json({ error: 'Bad Request', message: error.message });
      return;
    }

    if (error instanceof DomainError) {
      res.status(422).json({ error: 'Unprocessable Entity', message: error.message });
      return;
    }

    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: 'Internal Server Error', message });
  }
}
