import { IExecuteAITaskUseCase, ExecuteAITaskCommand } from '../ports/inbound/execute-ai-task.port.js';
import { TaskResponseDto, toTaskResponseDto } from '../ports/inbound/dto/task-response.dto.js';
import { ITaskRepository } from '../ports/outbound/task-repository.port.js';
import { IAIModelService } from '../ports/outbound/ai-model-service.port.js';
import { INotificationService } from '../ports/outbound/notification-service.port.js';
import { TaskId } from '../domain/value-objects/task-id.vo.js';
import { TaskNotFoundError } from '../domain/errors/domain-errors.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Application Use Case (INSIDE THE HEXAGON)
 * ============================================================================
 * 
 * USE CASE: Execute AI Task
 * Demonstrates the power of Hexagonal Architecture in coordinating:
 * - Persistence (Task Repository)
 * - AI Intelligence (AI Model Service)
 * - Real-world side effects (Notification Service)
 * 
 * Notice how this business logic is 100% testable in unit tests without
 * internet access, without a database, and without incurring OpenAI API costs!
 */
export class ExecuteAITaskUseCase implements IExecuteAITaskUseCase {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly aiModelService: IAIModelService,
    private readonly notificationService: INotificationService
  ) {}

  public async execute(command: ExecuteAITaskCommand): Promise<TaskResponseDto> {
    const taskId = TaskId.fromString(command.taskId);

    // 1. Fetch task from Outbound Repository Port
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new TaskNotFoundError(command.taskId);
    }

    const modelToUse = command.modelOverride || this.aiModelService.getDefaultModel();

    // 2. Transition domain state: PENDING -> RUNNING
    task.startExecution(modelToUse);
    await this.taskRepository.save(task);

    // 3. Delegate to AI Model Service Port
    try {
      const aiResult = await this.aiModelService.generateResponse(task.prompt, command.modelOverride);

      // 4. Transition domain state: RUNNING -> COMPLETED
      task.complete(aiResult.output, aiResult.tokensUsed);
      await this.taskRepository.save(task);

      // 5. Notify downstream listeners via Notification Port
      await this.notificationService.notifyTaskCompleted(task);

    } catch (error: any) {
      // 6. Transition domain state: RUNNING -> FAILED
      const errorMessage = error?.message || 'Unexpected failure during AI execution.';
      task.fail(errorMessage);
      await this.taskRepository.save(task);

      // 7. Alert listeners of failure
      await this.notificationService.notifyTaskFailed(task, errorMessage);
    }

    return toTaskResponseDto(task);
  }
}
