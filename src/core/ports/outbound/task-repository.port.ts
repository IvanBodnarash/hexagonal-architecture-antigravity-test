import { Task } from '../../domain/entities/task.entity.js';
import { TaskId } from '../../domain/value-objects/task-id.vo.js';
import { TaskStatus } from '../../domain/value-objects/task-status.vo.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Outbound / Driven Port (CONTRACT)
 * ============================================================================
 * 
 * WHAT IS AN OUTBOUND PORT?
 * An Outbound (or Driven) Port defines an interface for an external dependency
 * that our domain needs (such as a database, an external API, or message queue).
 * 
 * 💡 DEPENDENCY INVERSION PRINCIPLE (DIP):
 * Instead of our core domain depending on Prisma, PostgreSQL, or Mongo,
 * our domain defines THIS interface (`ITaskRepository`).
 * 
 * Real databases will implement this interface. This means:
 * - We can swap databases anytime without touching any domain logic.
 * - We can create an In-Memory repository for fast unit tests.
 */

export interface TaskFilterOptions {
  status?: TaskStatus;
  limit?: number;
}

export interface ITaskRepository {
  /**
   * Persists a task (inserts new or updates existing).
   */
  save(task: Task): Promise<void>;

  /**
   * Finds a task by its unique TaskId.
   * Returns null if not found.
   */
  findById(id: TaskId): Promise<Task | null>;

  /**
   * Finds all tasks matching optional filters.
   */
  findAll(options?: TaskFilterOptions): Promise<Task[]>;

  /**
   * Deletes a task by ID. Returns true if deleted, false if not found.
   */
  delete(id: TaskId): Promise<boolean>;

  /**
   * Counts the total number of tasks.
   */
  count(): Promise<number>;
}
