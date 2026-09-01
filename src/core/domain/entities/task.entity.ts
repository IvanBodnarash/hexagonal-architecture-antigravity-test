import { TaskId } from '../value-objects/task-id.vo.js';
import { TaskStatus } from '../value-objects/task-status.vo.js';
import { TaskPriority } from '../value-objects/task-priority.vo.js';
import { ValidationError, InvalidTaskStateTransitionError } from '../errors/domain-errors.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Core Domain -> Entity (INSIDE THE HEXAGON)
 * ============================================================================
 * 
 * WHAT IS A DOMAIN ENTITY?
 * A Domain Entity is the heart of your business logic. It has an identity (`id`)
 * and encapsulates all data plus business behaviors (methods).
 * 
 * ⚠️ GOLDEN RULE OF HEXAGONAL ARCHITECTURE:
 * Notice there are NO imports from:
 * - Express (req, res)
 * - Prisma / TypeORM / Sequelize
 * - External SDKs (OpenAI, Anthropic)
 * 
 * The Entity only cares about BUSINESS RULES, such as:
 * - A task must have a valid title and prompt.
 * - A task can only be completed if it was currently running.
 * - A completed task records its execution time, token usage, and AI output.
 */

export interface CreateTaskProps {
  title: string;
  prompt: string;
  priority?: TaskPriority;
}

export interface ReconstituteTaskProps {
  id: TaskId;
  title: string;
  prompt: string;
  priority: TaskPriority;
  status: TaskStatus;
  result: string | null;
  tokensUsed: number;
  modelUsed: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export class Task {
  private readonly _id: TaskId;
  private _title: string;
  private _prompt: string;
  private _priority: TaskPriority;
  private _status: TaskStatus;
  private _result: string | null;
  private _tokensUsed: number;
  private _modelUsed: string | null;
  private _errorMessage: string | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _completedAt: Date | null;

  private constructor(props: {
    id: TaskId;
    title: string;
    prompt: string;
    priority: TaskPriority;
    status: TaskStatus;
    result: string | null;
    tokensUsed: number;
    modelUsed: string | null;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date | null;
  }) {
    this._id = props.id;
    this._title = props.title;
    this._prompt = props.prompt;
    this._priority = props.priority;
    this._status = props.status;
    this._result = props.result;
    this._tokensUsed = props.tokensUsed;
    this._modelUsed = props.modelUsed;
    this._errorMessage = props.errorMessage;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._completedAt = props.completedAt;
  }

  /**
   * Factory method for creating a brand new Task.
   * Validates all initial business rules.
   */
  public static create(props: CreateTaskProps): Task {
    if (!props.title || props.title.trim().length === 0) {
      throw new ValidationError('Task title cannot be empty.');
    }
    if (props.title.length > 200) {
      throw new ValidationError('Task title cannot exceed 200 characters.');
    }
    if (!props.prompt || props.prompt.trim().length === 0) {
      throw new ValidationError('Task prompt/instruction cannot be empty.');
    }

    const now = new Date();
    return new Task({
      id: TaskId.create(),
      title: props.title.trim(),
      prompt: props.prompt.trim(),
      priority: props.priority ?? TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      result: null,
      tokensUsed: 0,
      modelUsed: null,
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    });
  }

  /**
   * Factory method used by Repositories to reconstitute a Task from database records.
   * Does not re-run creation validation (because data is already in the DB).
   */
  public static reconstitute(props: ReconstituteTaskProps): Task {
    return new Task(props);
  }

  // ==========================================================================
  // BUSINESS OPERATIONS (STATE TRANSITIONS & DOMAIN BEHAVIOR)
  // ==========================================================================

  /**
   * Transitions task from PENDING -> RUNNING.
   */
  public startExecution(modelName: string): void {
    if (!this._status.canTransitionTo(TaskStatus.RUNNING)) {
      throw new InvalidTaskStateTransitionError(
        this._status.value,
        TaskStatus.RUNNING.value,
        `Task must be in PENDING state to start execution.`
      );
    }
    this._status = TaskStatus.RUNNING;
    this._modelUsed = modelName;
    this._errorMessage = null;
    this._updatedAt = new Date();
  }

  /**
   * Transitions task from RUNNING -> COMPLETED.
   */
  public complete(result: string, tokensUsed: number): void {
    if (!this._status.canTransitionTo(TaskStatus.COMPLETED)) {
      throw new InvalidTaskStateTransitionError(
        this._status.value,
        TaskStatus.COMPLETED.value,
        `Task must be in RUNNING state to be completed.`
      );
    }
    if (!result || result.trim().length === 0) {
      throw new ValidationError('Task completion result cannot be empty.');
    }

    const now = new Date();
    this._status = TaskStatus.COMPLETED;
    this._result = result;
    this._tokensUsed = Math.max(0, tokensUsed);
    this._completedAt = now;
    this._updatedAt = now;
  }

  /**
   * Transitions task from RUNNING -> FAILED.
   */
  public fail(errorMessage: string): void {
    if (!this._status.canTransitionTo(TaskStatus.FAILED)) {
      throw new InvalidTaskStateTransitionError(
        this._status.value,
        TaskStatus.FAILED.value,
        `Task cannot fail from status "${this._status.value}".`
      );
    }
    this._status = TaskStatus.FAILED;
    this._errorMessage = errorMessage || 'Unknown error occurred during AI execution.';
    this._updatedAt = new Date();
    this._completedAt = new Date();
  }

  /**
   * Cancels a pending or running task.
   */
  public cancel(reason: string = 'User requested cancellation'): void {
    if (!this._status.canTransitionTo(TaskStatus.CANCELLED)) {
      throw new InvalidTaskStateTransitionError(
        this._status.value,
        TaskStatus.CANCELLED.value,
        `Completed or already terminated tasks cannot be cancelled.`
      );
    }
    this._status = TaskStatus.CANCELLED;
    this._errorMessage = `Cancelled: ${reason}`;
    this._updatedAt = new Date();
  }

  // ==========================================================================
  // GETTERS (Expose domain data safely)
  // ==========================================================================

  public get id(): TaskId { return this._id; }
  public get title(): string { return this._title; }
  public get prompt(): string { return this._prompt; }
  public get priority(): TaskPriority { return this._priority; }
  public get status(): TaskStatus { return this._status; }
  public get result(): string | null { return this._result; }
  public get tokensUsed(): number { return this._tokensUsed; }
  public get modelUsed(): string | null { return this._modelUsed; }
  public get errorMessage(): string | null { return this._errorMessage; }
  public get createdAt(): Date { return this._createdAt; }
  public get updatedAt(): Date { return this._updatedAt; }
  public get completedAt(): Date | null { return this._completedAt; }
}
