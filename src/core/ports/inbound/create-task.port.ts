import { TaskResponseDto } from './dto/task-response.dto.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Inbound / Driving Port (CONTRACT)
 * ============================================================================
 * 
 * WHAT IS AN INBOUND PORT?
 * An Inbound (or Driving) Port defines an interface for a specific USE CASE.
 * It specifies: "Here is what the outside world (REST API, CLI, Cron Job)
 * can ask the application to do."
 */

export interface CreateTaskCommand {
  title: string;
  prompt: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ICreateTaskUseCase {
  execute(command: CreateTaskCommand): Promise<TaskResponseDto>;
}
