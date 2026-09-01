import { ITaskRepository } from '../core/ports/outbound/task-repository.port.js';
import { IAIModelService } from '../core/ports/outbound/ai-model-service.port.js';
import { INotificationService } from '../core/ports/outbound/notification-service.port.js';

import { InMemoryTaskRepository } from '../adapters/driven/persistence/in-memory-task.repository.js';
import { FileTaskRepository } from '../adapters/driven/persistence/file-task.repository.js';
import { SimulatedAIAgentService } from '../adapters/driven/ai-services/simulated-ai-agent.service.js';
import { ConsoleNotificationService } from '../adapters/driven/notifications/console-notification.service.js';

import { CreateTaskUseCase } from '../core/use-cases/create-task.use-case.js';
import { ExecuteAITaskUseCase } from '../core/use-cases/execute-ai-task.use-case.js';
import { GetTaskUseCase } from '../core/use-cases/get-task.use-case.js';
import { ListTasksUseCase } from '../core/use-cases/list-tasks.use-case.js';

import { TaskController } from '../adapters/driving/rest-api/task.controller.js';
import { InteractiveCLI } from '../adapters/driving/cli/interactive-cli.js';
import { createExpressApp } from '../adapters/driving/rest-api/server.js';
import { Express } from 'express';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Composition Root / Dependency Injection (WIRING)
 * ============================================================================
 * 
 * WHAT IS THE COMPOSITION ROOT?
 * In Hexagonal Architecture, the "Composition Root" is the single place where
 * the application is assembled.
 * 
 * It:
 * 1. Chooses which Driven Adapters to instantiate (e.g. In-Memory vs File DB).
 * 2. Injects those adapters into the Use Cases.
 * 3. Injects the Use Cases into the Driving Adapters (Express Controller or CLI).
 * 
 * 💡 SWAPPING IMPLEMENTATIONS:
 * Notice how easy it is to change `storageType: 'file'` to `storageType: 'in-memory'`.
 * The rest of the entire system remains 100% unchanged!
 */

export interface AppConfig {
  storageType?: 'in-memory' | 'file';
  filePath?: string;
  defaultAIModel?: string;
  enableConsoleNotifications?: boolean;
}

export class AppContainer {
  // Driven Adapters (Outbound)
  public readonly taskRepository: ITaskRepository;
  public readonly aiModelService: IAIModelService;
  public readonly notificationService: INotificationService;

  // Use Cases (Core Application Services)
  public readonly createTaskUseCase: CreateTaskUseCase;
  public readonly executeAITaskUseCase: ExecuteAITaskUseCase;
  public readonly getTaskUseCase: GetTaskUseCase;
  public readonly listTasksUseCase: ListTasksUseCase;

  // Driving Adapters (Inbound)
  public readonly taskController: TaskController;
  public readonly interactiveCLI: InteractiveCLI;
  public readonly expressApp: Express;

  constructor(config: AppConfig = {}) {
    const storageType = config.storageType || 'in-memory';

    // 1. Instantiate Driven Adapters
    if (storageType === 'file') {
      this.taskRepository = new FileTaskRepository(config.filePath || './data/tasks.json');
    } else {
      this.taskRepository = new InMemoryTaskRepository();
    }

    this.aiModelService = new SimulatedAIAgentService(config.defaultAIModel || 'gemini-2.5-flash-simulated');
    this.notificationService = new ConsoleNotificationService(config.enableConsoleNotifications ?? true);

    // 2. Instantiate Use Cases (Injecting Driven Adapters)
    this.createTaskUseCase = new CreateTaskUseCase(this.taskRepository);
    this.executeAITaskUseCase = new ExecuteAITaskUseCase(
      this.taskRepository,
      this.aiModelService,
      this.notificationService
    );
    this.getTaskUseCase = new GetTaskUseCase(this.taskRepository);
    this.listTasksUseCase = new ListTasksUseCase(this.taskRepository);

    // 3. Instantiate Driving Adapters (Injecting Use Cases)
    this.taskController = new TaskController(
      this.createTaskUseCase,
      this.executeAITaskUseCase,
      this.getTaskUseCase,
      this.listTasksUseCase
    );

    this.interactiveCLI = new InteractiveCLI(
      this.createTaskUseCase,
      this.executeAITaskUseCase,
      this.getTaskUseCase,
      this.listTasksUseCase
    );

    this.expressApp = createExpressApp(this.taskController);
  }
}
