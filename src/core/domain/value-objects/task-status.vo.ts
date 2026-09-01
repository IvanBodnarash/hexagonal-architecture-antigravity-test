import { InvalidTaskStateTransitionError } from '../errors/domain-errors.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Core Domain -> Value Objects (INSIDE THE HEXAGON)
 * ============================================================================
 * 
 * WHY THIS IS IMPORTANT:
 * State transitions are critical business rules. For example:
 * - A task cannot go from COMPLETED back to PENDING.
 * - A task must be in RUNNING status before it can be COMPLETED or FAILED.
 * 
 * By encapsulating state machine logic inside this value object, we protect
 * our application from invalid states regardless of which database or UI is used.
 */

export type TaskStatusType = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export class TaskStatus {
  public static readonly PENDING = new TaskStatus('PENDING');
  public static readonly RUNNING = new TaskStatus('RUNNING');
  public static readonly COMPLETED = new TaskStatus('COMPLETED');
  public static readonly FAILED = new TaskStatus('FAILED');
  public static readonly CANCELLED = new TaskStatus('CANCELLED');

  private readonly _value: TaskStatusType;

  private constructor(value: TaskStatusType) {
    this._value = value;
  }

  public static fromString(status: string): TaskStatus {
    const upper = status?.toUpperCase() as TaskStatusType;
    switch (upper) {
      case 'PENDING': return TaskStatus.PENDING;
      case 'RUNNING': return TaskStatus.RUNNING;
      case 'COMPLETED': return TaskStatus.COMPLETED;
      case 'FAILED': return TaskStatus.FAILED;
      case 'CANCELLED': return TaskStatus.CANCELLED;
      default:
        throw new InvalidTaskStateTransitionError('UNKNOWN', status, 'Status must be PENDING, RUNNING, COMPLETED, FAILED, or CANCELLED.');
    }
  }

  public get value(): TaskStatusType {
    return this._value;
  }

  /**
   * Enforces legal transitions in the Task lifecycle.
   */
  public canTransitionTo(nextStatus: TaskStatus): boolean {
    if (this._value === 'PENDING') {
      return nextStatus._value === 'RUNNING' || nextStatus._value === 'CANCELLED';
    }
    if (this._value === 'RUNNING') {
      return nextStatus._value === 'COMPLETED' || nextStatus._value === 'FAILED' || nextStatus._value === 'CANCELLED';
    }
    // Terminal states: COMPLETED, FAILED, CANCELLED cannot transition any further
    return false;
  }

  public isTerminal(): boolean {
    return this._value === 'COMPLETED' || this._value === 'FAILED' || this._value === 'CANCELLED';
  }

  public equals(other: TaskStatus): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
