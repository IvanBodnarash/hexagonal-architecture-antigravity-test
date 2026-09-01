import { Task } from '../../../domain/entities/task.entity.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Ports -> DTO (Boundary Data Transfer Object)
 * ============================================================================
 * 
 * WHY USE DTOs INSTEAD OF RETURNING THE DOMAIN ENTITY DIRECTLY?
 * 1. Encapsulation: We do not leak internal domain methods (like .complete(), .fail())
 *    to HTTP controllers or CLI views.
 * 2. Serialization: Plain JSON objects serialize cleanly without private fields (_title, _id).
 * 3. Stability: We can change internal entity design without breaking API consumers.
 */

export interface TaskResponseDto {
  id: string;
  title: string;
  prompt: string;
  priority: string;
  status: string;
  result: string | null;
  tokensUsed: number;
  modelUsed: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export function toTaskResponseDto(task: Task): TaskResponseDto {
  return {
    id: task.id.value,
    title: task.title,
    prompt: task.prompt,
    priority: task.priority.value,
    status: task.status.value,
    result: task.result,
    tokensUsed: task.tokensUsed,
    modelUsed: task.modelUsed,
    errorMessage: task.errorMessage,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    completedAt: task.completedAt ? task.completedAt.toISOString() : null,
  };
}
