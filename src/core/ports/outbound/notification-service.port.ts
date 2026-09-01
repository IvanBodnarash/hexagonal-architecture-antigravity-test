import { Task } from '../../domain/entities/task.entity.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Outbound / Driven Port (CONTRACT)
 * ============================================================================
 * 
 * WHY THIS EXISTS:
 * When an AI agent finishes a task, downstream systems might want to know:
 * - A Discord or Slack webhook
 * - An email to the user
 * - A terminal log
 * 
 * The domain doesn't know or care how notifications are sent. It just calls this port.
 */

export interface INotificationService {
  /**
   * Broadcasts a notification when a task successfully completes.
   */
  notifyTaskCompleted(task: Task): Promise<void>;

  /**
   * Broadcasts an alert when a task execution fails.
   */
  notifyTaskFailed(task: Task, reason: string): Promise<void>;
}
