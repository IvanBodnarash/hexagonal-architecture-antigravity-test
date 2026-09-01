import { ValidationError } from '../errors/domain-errors.js';

/**
 * ============================================================================
 * ARCHITECTURE LAYER: Core Domain -> Value Objects (INSIDE THE HEXAGON)
 * ============================================================================
 */

export type TaskPriorityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export class TaskPriority {
  public static readonly LOW = new TaskPriority('LOW', 1);
  public static readonly MEDIUM = new TaskPriority('MEDIUM', 2);
  public static readonly HIGH = new TaskPriority('HIGH', 3);
  public static readonly CRITICAL = new TaskPriority('CRITICAL', 4);

  private readonly _value: TaskPriorityType;
  private readonly _weight: number;

  private constructor(value: TaskPriorityType, weight: number) {
    this._value = value;
    this._weight = weight;
  }

  public static fromString(priority: string = 'MEDIUM'): TaskPriority {
    const upper = priority?.toUpperCase() as TaskPriorityType;
    switch (upper) {
      case 'LOW': return TaskPriority.LOW;
      case 'MEDIUM': return TaskPriority.MEDIUM;
      case 'HIGH': return TaskPriority.HIGH;
      case 'CRITICAL': return TaskPriority.CRITICAL;
      default:
        throw new ValidationError(`Invalid priority "${priority}". Allowed: LOW, MEDIUM, HIGH, CRITICAL.`);
    }
  }

  public get value(): TaskPriorityType {
    return this._value;
  }

  public get weight(): number {
    return this._weight;
  }

  public isHigherThan(other: TaskPriority): boolean {
    return this._weight > other._weight;
  }

  public equals(other: TaskPriority): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
