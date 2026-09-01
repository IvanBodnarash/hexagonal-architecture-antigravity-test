import { TaskResponseDto } from './dto/task-response.dto.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Inbound / Driving Port (CONTRACT)
 * ============================================================================
 * 
 * USE CASE: Get a single task by ID
 */

export interface GetTaskQuery {
  taskId: string;
}

export interface IGetTaskUseCase {
  execute(query: GetTaskQuery): Promise<TaskResponseDto>;
}
