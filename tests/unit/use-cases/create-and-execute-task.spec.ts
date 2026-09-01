import { describe, it, expect, beforeEach } from 'vitest';
import { CreateTaskUseCase } from '../../../src/core/use-cases/create-task.use-case.js';
import { ExecuteAITaskUseCase } from '../../../src/core/use-cases/execute-ai-task.use-case.js';
import { GetTaskUseCase } from '../../../src/core/use-cases/get-task.use-case.js';
import { ListTasksUseCase } from '../../../src/core/use-cases/list-tasks.use-case.js';
import { InMemoryTaskRepository } from '../../../src/adapters/driven/persistence/in-memory-task.repository.js';
import { SimulatedAIAgentService } from '../../../src/adapters/driven/ai-services/simulated-ai-agent.service.js';
import { ConsoleNotificationService } from '../../../src/adapters/driven/notifications/console-notification.service.js';
import { TaskNotFoundError } from '../../../src/core/domain/errors/domain-errors.js';

describe('Use Cases: AI Task Management (Inside the Hexagon)', () => {
  let repo: InMemoryTaskRepository;
  let aiService: SimulatedAIAgentService;
  let notifService: ConsoleNotificationService;

  let createTaskUseCase: CreateTaskUseCase;
  let executeAITaskUseCase: ExecuteAITaskUseCase;
  let getTaskUseCase: GetTaskUseCase;
  let listTasksUseCase: ListTasksUseCase;

  beforeEach(() => {
    // Zero database setup or external mocking required!
    repo = new InMemoryTaskRepository();
    aiService = new SimulatedAIAgentService('test-model');
    notifService = new ConsoleNotificationService(false); // silent notifications in tests

    createTaskUseCase = new CreateTaskUseCase(repo);
    executeAITaskUseCase = new ExecuteAITaskUseCase(repo, aiService, notifService);
    getTaskUseCase = new GetTaskUseCase(repo);
    listTasksUseCase = new ListTasksUseCase(repo);
  });

  it('should create a new task through CreateTaskUseCase', async () => {
    const response = await createTaskUseCase.execute({
      title: 'Summarize documentation',
      prompt: 'Summarize hexagonal architecture rules',
      priority: 'HIGH',
    });

    expect(response.id).toBeDefined();
    expect(response.title).toBe('Summarize documentation');
    expect(response.status).toBe('PENDING');
    expect(response.priority).toBe('HIGH');

    const totalTasks = await repo.count();
    expect(totalTasks).toBe(1);
  });

  it('should execute a task with the AI model service and transition to COMPLETED', async () => {
    const created = await createTaskUseCase.execute({
      title: 'Generate React Component',
      prompt: 'Write a typescript React button component with Tailwind classes',
    });

    const executed = await executeAITaskUseCase.execute({
      taskId: created.id,
    });

    expect(executed.status).toBe('COMPLETED');
    expect(executed.result).toBeDefined();
    expect(executed.tokensUsed).toBeGreaterThan(0);
    expect(executed.completedAt).not.toBeNull();
  });

  it('should throw TaskNotFoundError when executing a non-existent task ID', async () => {
    const fakeId = '00000000-0000-4000-8000-000000000000';
    await expect(executeAITaskUseCase.execute({ taskId: fakeId })).rejects.toThrow(TaskNotFoundError);
  });

  it('should list and filter tasks by status', async () => {
    const t1 = await createTaskUseCase.execute({ title: 'Task 1', prompt: 'Prompt 1' });
    const t2 = await createTaskUseCase.execute({ title: 'Task 2', prompt: 'Prompt 2' });

    // Execute t1 so it becomes COMPLETED
    await executeAITaskUseCase.execute({ taskId: t1.id });

    const allTasks = await listTasksUseCase.execute();
    expect(allTasks).toHaveLength(2);

    const pendingTasks = await listTasksUseCase.execute({ status: 'PENDING' });
    expect(pendingTasks).toHaveLength(1);
    expect(pendingTasks[0].id).toBe(t2.id);

    const completedTasks = await listTasksUseCase.execute({ status: 'COMPLETED' });
    expect(completedTasks).toHaveLength(1);
    expect(completedTasks[0].id).toBe(t1.id);
  });
});
