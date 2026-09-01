import { IListTasksUseCase, ListTasksQuery } from '../ports/inbound/list-tasks.port.js';
import { TaskResponseDto, toTaskResponseDto } from '../ports/inbound/dto/task-response.dto.js';
import { ITaskRepository } from '../ports/outbound/task-repository.port.js';
import { TaskStatus } from '../domain/value-objects/task-status.vo.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Application Use Case (INSIDE THE HEXAGON)
 * ============================================================================
 */
export class ListTasksUseCase implements IListTasksUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  public async execute(query?: ListTasksQuery): Promise<TaskResponseDto[]> {
    const statusFilter = query?.status 
      ? TaskStatus.fromString(query.status) 
      : undefined;

    const tasks = await this.taskRepository.findAll({
      status: statusFilter,
      limit: query?.limit,
    });

    return tasks.map(toTaskResponseDto);
  }
}
