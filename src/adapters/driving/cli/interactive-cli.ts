import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { ICreateTaskUseCase } from '../../../core/ports/inbound/create-task.port.js';
import { IExecuteAITaskUseCase } from '../../../core/ports/inbound/execute-ai-task.port.js';
import { IGetTaskUseCase } from '../../../core/ports/inbound/get-task.port.js';
import { IListTasksUseCase } from '../../../core/ports/inbound/list-tasks.port.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Driving / Inbound Adapter -> Terminal CLI (OUTSIDE THE HEXAGON)
 * ============================================================================
 * 
 * 💡 THE "AHA!" MOMENT OF HEXAGONAL ARCHITECTURE:
 * Look at the constructor of `InteractiveCLI`: it takes the EXACT SAME use cases
 * as the `TaskController` (Express REST API)!
 * 
 * We did not modify a single line of business logic to create this CLI.
 * We simply created a new driving adapter that plugs into the exact same ports.
 */
export class InteractiveCLI {
  constructor(
    private readonly createTaskUseCase: ICreateTaskUseCase,
    private readonly executeAITaskUseCase: IExecuteAITaskUseCase,
    private readonly getTaskUseCase: IGetTaskUseCase,
    private readonly listTasksUseCase: IListTasksUseCase
  ) {}

  public async start(): Promise<void> {
    const rl = readline.createInterface({ input, output });

    console.log('\n======================================================');
    console.log('🤖 AI AGENT TASK MANAGER — TERMINAL CLI ADAPTER');
    console.log('Hexagonal Architecture (Ports & Adapters) in action');
    console.log('======================================================');

    let running = true;

    while (running) {
      console.log('\nAvailable Actions:');
      console.log('  1. 📝 Create a new AI Task');
      console.log('  2. 📋 List all Tasks');
      console.log('  3. 🔍 View Task details by ID');
      console.log('  4. 🚀 Execute Task with AI Agent');
      console.log('  5. 🚪 Exit CLI');

      const choice = (await rl.question('\nSelect an option (1-5): ')).trim();

      switch (choice) {
        case '1':
          await this.handleCreateTask(rl);
          break;
        case '2':
          await this.handleListTasks();
          break;
        case '3':
          await this.handleGetTask(rl);
          break;
        case '4':
          await this.handleExecuteTask(rl);
          break;
        case '5':
          console.log('\n👋 Exiting CLI. Goodbye!');
          running = false;
          break;
        default:
          console.log('⚠️  Invalid choice. Please select a number from 1 to 5.');
      }
    }

    rl.close();
  }

  private async handleCreateTask(rl: readline.Interface): Promise<void> {
    console.log('\n--- Create a New AI Task ---');
    const title = await rl.question('Enter Task Title: ');
    const prompt = await rl.question('Enter Prompt / Instructions for AI Agent: ');
    const priorityInput = (await rl.question('Priority (LOW, MEDIUM, HIGH, CRITICAL) [default: MEDIUM]: ')).trim().toUpperCase();

    const priority = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priorityInput) 
      ? (priorityInput as any) 
      : 'MEDIUM';

    try {
      const task = await this.createTaskUseCase.execute({ title, prompt, priority });
      console.log('\n✅ Task created successfully!');
      console.log(`   ID:       ${task.id}`);
      console.log(`   Title:    ${task.title}`);
      console.log(`   Status:   ${task.status}`);
      console.log(`   Priority: ${task.priority}`);
    } catch (err: any) {
      console.error(`❌ Failed to create task: ${err.message}`);
    }
  }

  private async handleListTasks(): Promise<void> {
    console.log('\n--- Task List ---');
    try {
      const tasks = await this.listTasksUseCase.execute();
      if (tasks.length === 0) {
        console.log('No tasks found. Create one first!');
        return;
      }

      console.table(
        tasks.map(t => ({
          ID: t.id.slice(0, 8) + '...',
          FullID: t.id,
          Title: t.title.length > 25 ? t.title.slice(0, 25) + '...' : t.title,
          Status: t.status,
          Priority: t.priority,
          Tokens: t.tokensUsed,
        }))
      );
    } catch (err: any) {
      console.error(`❌ Failed to list tasks: ${err.message}`);
    }
  }

  private async handleGetTask(rl: readline.Interface): Promise<void> {
    const id = (await rl.question('\nEnter full Task ID: ')).trim();
    try {
      const task = await this.getTaskUseCase.execute({ taskId: id });
      console.log('\n--- Task Details ---');
      console.log(`ID:           ${task.id}`);
      console.log(`Title:        ${task.title}`);
      console.log(`Prompt:       ${task.prompt}`);
      console.log(`Status:       ${task.status}`);
      console.log(`Priority:     ${task.priority}`);
      console.log(`Model Used:   ${task.modelUsed || 'N/A'}`);
      console.log(`Tokens Used:  ${task.tokensUsed}`);
      console.log(`Created At:   ${task.createdAt}`);
      console.log(`Completed At: ${task.completedAt || 'N/A'}`);
      if (task.result) {
        console.log('\n--- AI Execution Result ---');
        console.log(task.result);
      }
      if (task.errorMessage) {
        console.log(`\n❌ Error: ${task.errorMessage}`);
      }
    } catch (err: any) {
      console.error(`❌ Error fetching task: ${err.message}`);
    }
  }

  private async handleExecuteTask(rl: readline.Interface): Promise<void> {
    const id = (await rl.question('\nEnter Task ID to execute: ')).trim();
    console.log('\n⏳ Dispatching task to AI Agent...');

    try {
      const result = await this.executeAITaskUseCase.execute({ taskId: id });
      console.log('\n✨ Task execution completed!');
      console.log(`Status:      ${result.status}`);
      console.log(`Tokens Used: ${result.tokensUsed}`);
      console.log(`Model:       ${result.modelUsed}`);
      console.log('\n--- AI Generated Output ---');
      console.log(result.result);
    } catch (err: any) {
      console.error(`❌ Execution failed: ${err.message}`);
    }
  }
}
