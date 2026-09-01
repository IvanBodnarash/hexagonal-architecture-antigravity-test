import { AppContainer } from './container/app-container.js';
import { InMemoryTaskRepository } from './adapters/driven/persistence/in-memory-task.repository.js';
import { FileTaskRepository } from './adapters/driven/persistence/file-task.repository.js';
import { SimulatedAIAgentService } from './adapters/driven/ai-services/simulated-ai-agent.service.js';
import { ConsoleNotificationService } from './adapters/driven/notifications/console-notification.service.js';
import { CreateTaskUseCase } from './core/use-cases/create-task.use-case.js';
import { ExecuteAITaskUseCase } from './core/use-cases/execute-ai-task.use-case.js';
import { ListTasksUseCase } from './core/use-cases/list-tasks.use-case.js';

/**
 * ============================================================================
 * HEXAGONAL ARCHITECTURE MASTERCLASS: LIVE DEMONSTRATION SCRIPT
 * ============================================================================
 * 
 * Run with: npm run demo
 */

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runMasterclassDemo() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║        HEXAGONAL ARCHITECTURE (PORTS & ADAPTERS) MASTERCLASS         ║');
  console.log('║                   AI Agent Task Execution System                     ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  // --------------------------------------------------------------------------
  // STEP 1: Setting up the Hexagon with In-Memory Storage
  // --------------------------------------------------------------------------
  console.log('🔹 STEP 1: Plugging Adapters into Ports (In-Memory Setup)');
  console.log('   - Driven Storage Adapter:       InMemoryTaskRepository');
  console.log('   - Driven AI Service Adapter:    SimulatedAIAgentService');
  console.log('   - Driven Notification Adapter:  ConsoleNotificationService\n');

  const inMemoryRepo = new InMemoryTaskRepository();
  const aiService = new SimulatedAIAgentService('gemini-2.5-pro-agent');
  const notificationService = new ConsoleNotificationService(true);

  // Wire Use Cases (The Inbound Ports)
  const createTask = new CreateTaskUseCase(inMemoryRepo);
  const executeTask = new ExecuteAITaskUseCase(inMemoryRepo, aiService, notificationService);
  const listTasks = new ListTasksUseCase(inMemoryRepo);

  await sleep(1000);

  // --------------------------------------------------------------------------
  // STEP 2: Executing Inbound Port (Create Task)
  // --------------------------------------------------------------------------
  console.log('🔹 STEP 2: Triggering Inbound Port (CreateTaskUseCase)');
  const newTask = await createTask.execute({
    title: 'Design Hexagonal Architecture Diagram',
    prompt: 'Summarize how ports and adapters decouple business logic from databases and frameworks.',
    priority: 'HIGH',
  });

  console.log('   ✅ Task Created inside Domain Core:');
  console.log(`      ID:       ${newTask.id}`);
  console.log(`      Status:   ${newTask.status}`);
  console.log(`      Priority: ${newTask.priority}`);

  await sleep(1200);

  // --------------------------------------------------------------------------
  // STEP 3: Executing Inbound Port (Execute AI Task)
  // --------------------------------------------------------------------------
  console.log('\n🔹 STEP 3: Triggering Inbound Port (ExecuteAITaskUseCase)');
  console.log('   -> State changes: PENDING -> RUNNING -> AI Model Execution -> COMPLETED');

  const executedTask = await executeTask.execute({
    taskId: newTask.id,
  });

  console.log('   ✅ Execution Result from AI Model Port:');
  console.log(`      Tokens Used: ${executedTask.tokensUsed}`);
  console.log(`      Model Used:  ${executedTask.modelUsed}`);
  console.log(`      Status:      ${executedTask.status}`);
  console.log('\n--- Generated AI Output ---');
  console.log(executedTask.result);
  console.log('---------------------------\n');

  await sleep(1500);

  // --------------------------------------------------------------------------
  // STEP 4: The Superpower of Hexagonal Architecture: Swapping Adapters!
  // --------------------------------------------------------------------------
  console.log('🔹 STEP 4: THE SUPERPOWER — Swapping Outbound Adapters');
  console.log('   Now let\'s swap InMemoryTaskRepository -> FileTaskRepository (JSON on disk).');
  console.log('   Notice: ZERO changes to CreateTaskUseCase, ExecuteAITaskUseCase, or Domain logic!\n');

  const fileRepo = new FileTaskRepository('./data/demo-tasks.json');
  const fileCreateTask = new CreateTaskUseCase(fileRepo);
  const fileExecuteTask = new ExecuteAITaskUseCase(fileRepo, aiService, notificationService);
  const fileListTasks = new ListTasksUseCase(fileRepo);

  const fileSavedTask = await fileCreateTask.execute({
    title: 'Code Refactoring with AI Agents',
    prompt: 'Write a typescript function to validate user tokens and permissions.',
    priority: 'CRITICAL',
  });

  console.log(`   ✅ Saved to File Storage: Task ID ${fileSavedTask.id}`);
  await fileExecuteTask.execute({ taskId: fileSavedTask.id });

  const allFileTasks = await fileListTasks.execute();
  console.log(`   📂 Total persistent tasks on disk: ${allFileTasks.length}`);

  console.log('\n======================================================================');
  console.log('🎉 DEMO COMPLETE! Hexagonal Architecture demonstrated successfully.');
  console.log('   Next steps:');
  console.log('   1. Run interactive CLI:  npm run cli');
  console.log('   2. Run REST API server:  npm start');
  console.log('   3. Run automated tests:  npm test');
  console.log('======================================================================\n');
}

runMasterclassDemo().catch(console.error);
