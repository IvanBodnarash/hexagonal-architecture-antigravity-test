import { ITaskRepository, TaskFilterOptions } from '../../../core/ports/outbound/task-repository.port.js';
import { Task } from '../../../core/domain/entities/task.entity.js';
import { TaskId } from '../../../core/domain/value-objects/task-id.vo.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Driven / Outbound Adapter (OUTSIDE THE HEXAGON)
 * ============================================================================
 * 
 * WHAT IS THIS FILE?
 * An In-Memory database adapter implementing the `ITaskRepository` Port.
 * 
 * WHY IS THIS POWERFUL?
 * 1. Zero Setup: Anyone can clone this repository and run `npm start` immediately
 *    without installing PostgreSQL, Docker, or configuring database credentials.
 * 2. Instant Unit Tests: Tests can run in 5 milliseconds without spinning up Docker.
 * 3. Contract Fulfillment: Because it implements `ITaskRepository`, the rest of the
 *    application doesn't know (and doesn't care) that data is in RAM!
 */
export class InMemoryTaskRepository implements ITaskRepository {
  private readonly tasks: Map<string, Task> = new Map();

  public async save(task: Task): Promise<void> {
    this.tasks.set(task.id.value, task);
  }

  public async findById(id: TaskId): Promise<Task | null> {
    const task = this.tasks.get(id.value);
    return task || null;
  }

  public async findAll(options?: TaskFilterOptions): Promise<Task[]> {
    let result = Array.from(this.tasks.values());

    if (options?.status) {
      result = result.filter(task => task.status.equals(options.status!));
    }

    // Sort newest first
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (options?.limit && options.limit > 0) {
      result = result.slice(0, options.limit);
    }

    return result;
  }

  public async delete(id: TaskId): Promise<boolean> {
    return this.tasks.delete(id.value);
  }

  public async count(): Promise<number> {
    return this.tasks.size;
  }

  /**
   * Helper method for testing: clears all stored tasks.
   */
  public clear(): void {
    this.tasks.clear();
  }
}
