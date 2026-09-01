import { describe, it, expect } from 'vitest';
import { Task } from '../../../src/core/domain/entities/task.entity.js';
import { TaskPriority } from '../../../src/core/domain/value-objects/task-priority.vo.js';
import { TaskStatus } from '../../../src/core/domain/value-objects/task-status.vo.js';
import { ValidationError, InvalidTaskStateTransitionError } from '../../../src/core/domain/errors/domain-errors.js';

describe('Domain: Task Entity & Business Rules', () => {
  it('should create a valid task in PENDING status', () => {
    const task = Task.create({
      title: 'Analyze LLM architecture',
      prompt: 'Provide an in-depth breakdown of transformer attention heads',
      priority: TaskPriority.HIGH,
    });

    expect(task.id).toBeDefined();
    expect(task.title).toBe('Analyze LLM architecture');
    expect(task.prompt).toBe('Provide an in-depth breakdown of transformer attention heads');
    expect(task.status.value).toBe('PENDING');
    expect(task.priority.value).toBe('HIGH');
    expect(task.result).toBeNull();
    expect(task.tokensUsed).toBe(0);
    expect(task.completedAt).toBeNull();
  });

  it('should reject empty title or prompt with ValidationError', () => {
    expect(() => {
      Task.create({ title: '', prompt: 'Valid prompt' });
    }).toThrow(ValidationError);

    expect(() => {
      Task.create({ title: 'Valid title', prompt: '   ' });
    }).toThrow(ValidationError);
  });

  it('should transition through proper lifecycle: PENDING -> RUNNING -> COMPLETED', () => {
    const task = Task.create({
      title: 'Generate SQL Query',
      prompt: 'Select users created last week',
    });

    // Start execution
    task.startExecution('gemini-2.5-flash');
    expect(task.status.value).toBe('RUNNING');
    expect(task.modelUsed).toBe('gemini-2.5-flash');

    // Complete execution
    task.complete('SELECT * FROM users WHERE created_at >= NOW() - INTERVAL 7 DAY', 145);
    expect(task.status.value).toBe('COMPLETED');
    expect(task.result).toContain('SELECT * FROM users');
    expect(task.tokensUsed).toBe(145);
    expect(task.completedAt).toBeInstanceOf(Date);
  });

  it('should prevent illegal state transitions (e.g. COMPLETED -> RUNNING)', () => {
    const task = Task.create({
      title: 'Test State Violation',
      prompt: 'Some prompt',
    });

    task.startExecution('model-a');
    task.complete('All done', 50);

    expect(() => {
      task.startExecution('model-b');
    }).toThrow(InvalidTaskStateTransitionError);
  });

  it('should allow failing a running task', () => {
    const task = Task.create({
      title: 'API Rate Limit Task',
      prompt: 'Generate 1000 items',
    });

    task.startExecution('gemini-flash');
    task.fail('Rate limit exceeded from provider');

    expect(task.status.value).toBe('FAILED');
    expect(task.errorMessage).toContain('Rate limit exceeded');
  });

  it('should allow cancelling a pending task', () => {
    const task = Task.create({
      title: 'Cancelled Task',
      prompt: 'Do something later',
    });

    task.cancel('No longer needed');
    expect(task.status.value).toBe('CANCELLED');
  });
});
