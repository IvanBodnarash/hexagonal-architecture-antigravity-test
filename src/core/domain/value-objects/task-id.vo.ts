import { randomUUID } from 'node:crypto';
import { ValidationError } from '../errors/domain-errors.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Core Domain -> Value Objects (INSIDE THE HEXAGON)
 * ============================================================================
 * 
 * WHAT IS A VALUE OBJECT?
 * A Value Object is an immutable object defined by its attributes rather than
 * a database ID. It guarantees that invalid data can NEVER enter our domain.
 * 
 * WHY USE TaskId INSTEAD OF A PLAIN STRING?
 * 1. Type Safety: You cannot accidentally pass a userId where a taskId is expected.
 * 2. Self-Validation: An invalid UUID string will be rejected immediately upon creation.
 */
export class TaskId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Factory method to create a brand new random TaskId.
   */
  public static create(): TaskId {
    return new TaskId(randomUUID());
  }

  /**
   * Factory method to recreate a TaskId from an existing string.
   */
  public static fromString(id: string): TaskId {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new ValidationError('Task ID cannot be empty.');
    }
    // Basic UUID validation format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new ValidationError(`"${id}" is not a valid UUID format.`);
    }
    return new TaskId(id);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: TaskId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
