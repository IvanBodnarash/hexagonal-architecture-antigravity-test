import { ICreateTaskUseCase, CreateTaskCommand } from '../ports/inbound/create-task.port.js';
import { TaskResponseDto, toTaskResponseDto } from '../ports/inbound/dto/task-response.dto.js';
import { ITaskRepository } from '../ports/outbound/task-repository.port.js';
import { Task } from '../domain/entities/task.entity.js';
import { TaskPriority } from '../domain/value-objects/task-priority.vo.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Application Use Case (INSIDE THE HEXAGON)
 * ============================================================================
 * 
 * WHAT DOES A USE CASE DO?
 * A Use Case is an "orchestrator":
 * 1. Takes input data from an Inbound Port (`CreateTaskCommand`)
 * 2. Invokes domain logic (`Task.create(...)`)
 * 3. Calls Outbound Ports (`taskRepository.save(...)`)
 * 4. Returns clean output (`TaskResponseDto`)
 * 
 * 💡 DEPENDENCY INJECTION IN ACTION:
 * Notice `CreateTaskUseCase` receives `ITaskRepository` via its constructor.
 * It has NO IDEA if the repository is In-Memory, Prisma, or MongoDB!
 */
export class CreateTaskUseCase implements ICreateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  public async execute(command: CreateTaskCommand): Promise<TaskResponseDto> {
    const priority = command.priority 
      ? TaskPriority.fromString(command.priority) 
      : TaskPriority.MEDIUM;

    // 1. Create pure Domain Entity (enforces domain rules & invariants)
    const task = Task.create({
      title: command.title,
      prompt: command.prompt,
      priority,
    });

    // 2. Persist using the Outbound Port
    await this.taskRepository.save(task);

    // 3. Return a decoupled DTO
    return toTaskResponseDto(task);
  }
}
