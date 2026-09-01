/**
 * ============================================================================
 * ARCHITECTURE LAYER: Core Domain -> Errors (INSIDE THE HEXAGON)
 * ============================================================================
 * 
 * WHY THIS FILE EXISTS:
 * In Hexagonal Architecture, domain errors represent business rule violations.
 * They are pure JavaScript/TypeScript errors, completely independent of HTTP
 * status codes (like 400 or 404). 
 * 
 * Driving adapters (like Express controllers) will later translate these domain
 * errors into appropriate HTTP responses (e.g. TaskNotFoundError -> 404).
 */

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class TaskNotFoundError extends DomainError {
  constructor(taskId: string) {
    super(`Task with ID "${taskId}" was not found.`);
  }
}

export class InvalidTaskStateTransitionError extends DomainError {
  constructor(fromState: string, toState: string, reason?: string) {
    const detail = reason ? ` Reason: ${reason}` : '';
    super(`Invalid task state transition from "${fromState}" to "${toState}".${detail}`);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(`Validation failed: ${message}`);
  }
}
