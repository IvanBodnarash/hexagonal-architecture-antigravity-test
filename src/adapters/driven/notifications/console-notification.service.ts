import { INotificationService } from '../../../core/ports/outbound/notification-service.port.js';
import { Task } from '../../../core/domain/entities/task.entity.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Driven / Outbound Adapter (OUTSIDE THE HEXAGON)
 * ============================================================================
 * 
 * WHAT IS THIS FILE?
 * A Console Notification adapter implementing `INotificationService`.
 * 
 * WHY NOT JUST PUT console.log() INSIDE THE USE CASE?
 * If you put console.log or Slack webhook calls inside the Use Case, the Use Case
 * is now polluted with logging/networking dependencies.
 * 
 * By using this Adapter, we can switch to Discord, Slack, SendGrid Email, or Datadog
 * simply by plugging in a different adapter class!
 */
export class ConsoleNotificationService implements INotificationService {
  private readonly enabled: boolean;

  constructor(enabled: boolean = true) {
    this.enabled = enabled;
  }

  public async notifyTaskCompleted(task: Task): Promise<void> {
    if (!this.enabled) return;

    console.log('\n======================================================');
    console.log(`🎉 [EVENT: TASK_COMPLETED] Notification Dispatcher`);
    console.log(`Task ID:    ${task.id.value}`);
    console.log(`Title:      ${task.title}`);
    console.log(`Model:      ${task.modelUsed}`);
    console.log(`Tokens:     ${task.tokensUsed}`);
    console.log(`Completed:  ${task.completedAt?.toISOString()}`);
    console.log('======================================================\n');
  }

  public async notifyTaskFailed(task: Task, reason: string): Promise<void> {
    if (!this.enabled) return;

    console.error('\n======================================================');
    console.error(`❌ [EVENT: TASK_FAILED] Notification Dispatcher`);
    console.error(`Task ID:    ${task.id.value}`);
    console.error(`Title:      ${task.title}`);
    console.error(`Error:      ${reason}`);
    console.error('======================================================\n');
  }
}
