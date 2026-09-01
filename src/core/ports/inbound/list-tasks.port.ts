import { TaskResponseDto } from './dto/task-response.dto.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Inbound / Driving Port (CONTRACT)
 * ============================================================================
 * 
 * USE CASE: List tasks with optional status filtering
 */

export interface ListTasksQuery {
  status?: string;
  limit?: number;
}

export interface IListTasksUseCase {
  execute(query?: ListTasksQuery): Promise<TaskResponseDto[]>;
}
