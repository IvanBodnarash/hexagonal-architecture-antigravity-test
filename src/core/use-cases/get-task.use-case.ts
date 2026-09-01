import { IGetTaskUseCase, GetTaskQuery } from '../ports/inbound/get-task.port.js';
import { TaskResponseDto, toTaskResponseDto } from '../ports/inbound/dto/task-response.dto.js';
import { ITaskRepository } from '../ports/outbound/task-repository.port.js';
import { TaskId } from '../domain/value-objects/task-id.vo.js';
import { TaskNotFoundError } from '../domain/errors/domain-errors.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Application Use Case (INSIDE THE HEXAGON)
 * ============================================================================
 */
export class GetTaskUseCase implements IGetTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  public async execute(query: GetTaskQuery): Promise<TaskResponseDto> {
    const taskId = TaskId.fromString(query.taskId);
    const task = await this.taskRepository.findById(taskId);

    if (!task) {
      throw new TaskNotFoundError(query.taskId);
    }

    return toTaskResponseDto(task);
  }
}
