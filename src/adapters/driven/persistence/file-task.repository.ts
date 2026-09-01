import fs from 'node:fs/promises';
import path from 'node:path';
import { ITaskRepository, TaskFilterOptions } from '../../../core/ports/outbound/task-repository.port.js';
import { Task } from '../../../core/domain/entities/task.entity.js';
import { TaskId } from '../../../core/domain/value-objects/task-id.vo.js';
import { TaskStatus } from '../../../core/domain/value-objects/task-status.vo.js';
import { TaskPriority } from '../../../core/domain/value-objects/task-priority.vo.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Driven / Outbound Adapter (OUTSIDE THE HEXAGON)
 * ============================================================================
 * 
 * WHAT IS THIS FILE?
 * A file-based persistent storage adapter implementing `ITaskRepository`.
 * 
 * 💡 THE ADAPTER MAPPING PATTERN:
 * Notice how this file reads/writes raw JSON on disk, and uses `Task.reconstitute()`
 * to convert raw database rows into rich Domain Entities.
 * 
 * This is where Prisma, Sequelize, Mongoose, or TypeORM would live!
 */

interface TaskFileRecord {
  id: string;
  title: string;
  prompt: string;
  priority: string;
  status: string;
  result: string | null;
  tokensUsed: number;
  modelUsed: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export class FileTaskRepository implements ITaskRepository {
  private readonly filePath: string;

  constructor(filePath: string = './data/tasks.json') {
    this.filePath = path.resolve(process.cwd(), filePath);
  }

  private async ensureFileExists(): Promise<void> {
    try {
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });
      try {
        await fs.access(this.filePath);
      } catch {
        await fs.writeFile(this.filePath, JSON.stringify([], null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('Failed to initialize task storage file:', err);
    }
  }

  private async readRecords(): Promise<TaskFileRecord[]> {
    await this.ensureFileExists();
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data || '[]');
    } catch {
      return [];
    }
  }

  private async writeRecords(records: TaskFileRecord[]): Promise<void> {
    await this.ensureFileExists();
    await fs.writeFile(this.filePath, JSON.stringify(records, null, 2), 'utf-8');
  }

  private toDomain(record: TaskFileRecord): Task {
    return Task.reconstitute({
      id: TaskId.fromString(record.id),
      title: record.title,
      prompt: record.prompt,
      priority: TaskPriority.fromString(record.priority),
      status: TaskStatus.fromString(record.status),
      result: record.result,
      tokensUsed: record.tokensUsed,
      modelUsed: record.modelUsed,
      errorMessage: record.errorMessage,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
      completedAt: record.completedAt ? new Date(record.completedAt) : null,
    });
  }

  private toRecord(task: Task): TaskFileRecord {
    return {
      id: task.id.value,
      title: task.title,
      prompt: task.prompt,
      priority: task.priority.value,
      status: task.status.value,
      result: task.result,
      tokensUsed: task.tokensUsed,
      modelUsed: task.modelUsed,
      errorMessage: task.errorMessage,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,
    };
  }

  public async save(task: Task): Promise<void> {
    const records = await this.readRecords();
    const index = records.findIndex(r => r.id === task.id.value);
    const newRecord = this.toRecord(task);

    if (index >= 0) {
      records[index] = newRecord;
    } else {
      records.push(newRecord);
    }

    await this.writeRecords(records);
  }

  public async findById(id: TaskId): Promise<Task | null> {
    const records = await this.readRecords();
    const record = records.find(r => r.id === id.value);
    return record ? this.toDomain(record) : null;
  }

  public async findAll(options?: TaskFilterOptions): Promise<Task[]> {
    const records = await this.readRecords();
    let tasks = records.map(r => this.toDomain(r));

    if (options?.status) {
      tasks = tasks.filter(t => t.status.equals(options.status!));
    }

    tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (options?.limit && options.limit > 0) {
      tasks = tasks.slice(0, options.limit);
    }

    return tasks;
  }

  public async delete(id: TaskId): Promise<boolean> {
    const records = await this.readRecords();
    const filtered = records.filter(r => r.id !== id.value);
    if (filtered.length !== records.length) {
      await this.writeRecords(filtered);
      return true;
    }
    return false;
  }

  public async count(): Promise<number> {
    const records = await this.readRecords();
    return records.length;
  }
}
