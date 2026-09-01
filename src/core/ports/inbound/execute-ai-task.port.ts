import { TaskResponseDto } from './dto/task-response.dto.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Inbound / Driving Port (CONTRACT)
 * ============================================================================
 * 
 * USE CASE: Execute an AI Task
 * Instructs the AI agent system to take a pending task, invoke the AI model,
 * process the prompt, record the output, and notify downstream listeners.
 */

export interface ExecuteAITaskCommand {
  taskId: string;
  modelOverride?: string;
}

export interface IExecuteAITaskUseCase {
  execute(command: ExecuteAITaskCommand): Promise<TaskResponseDto>;
}
