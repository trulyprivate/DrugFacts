import { Injectable, ServiceUnavailableException } from '@nestjs/common';

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeout?: number;
  halfOpenMaxAttempts?: number;
}

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

class CircuitBreakerState {
  private state = CircuitState.CLOSED;
  private failures = 0;
  private lastFailureTime?: Date;
  private halfOpenAttempts = 0;

  constructor(
    private readonly failureThreshold: number,
    private readonly resetTimeout: number,
    private readonly halfOpenMaxAttempts: number,
  ) {}

  isOpen(): boolean {
    return this.state === CircuitState.OPEN;
  }

  isHalfOpen(): boolean {
    return this.state === CircuitState.HALF_OPEN;
  }

  recordSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
    }
    this.failures = 0;
    this.halfOpenAttempts = 0;
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = new Date();

    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenAttempts++;
      if (this.halfOpenAttempts >= this.halfOpenMaxAttempts) {
        this.open();
      }
    }
  }

  shouldOpen(): boolean {
    return this.failures >= this.failureThreshold;
  }

  open(): void {
    this.state = CircuitState.OPEN;
  }

  halfOpen(): void {
    this.state = CircuitState.HALF_OPEN;
    this.halfOpenAttempts = 0;
  }

  canAttemptReset(): boolean {
    if (this.state !== CircuitState.OPEN || !this.lastFailureTime) {
      return false;
    }

    const now = new Date();
    const timeSinceLastFailure = now.getTime() - this.lastFailureTime.getTime();
    return timeSinceLastFailure >= this.resetTimeout;
  }
}

@Injectable()
export class CircuitBreakerService {
  private readonly states = new Map<string, CircuitBreakerState>();
  private readonly defaultOptions: Required<CircuitBreakerOptions> = {
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minute
    halfOpenMaxAttempts: 3,
  };

  async call<T>(
    key: string,
    fn: () => Promise<T>,
    options: CircuitBreakerOptions = {},
  ): Promise<T> {
    const config = { ...this.defaultOptions, ...options };
    const state = this.getState(key, config);

    // Check if circuit should transition from OPEN to HALF_OPEN
    if (state.isOpen() && state.canAttemptReset()) {
      state.halfOpen();
    }

    if (state.isOpen()) {
      throw new ServiceUnavailableException(
        `Service ${key} is temporarily unavailable. Circuit breaker is OPEN.`,
      );
    }

    try {
      const result = await fn();
      state.recordSuccess();
      return result;
    } catch (error) {
      state.recordFailure();

      if (state.shouldOpen()) {
        state.open();
        setTimeout(() => {
          if (state.isOpen()) {
            state.halfOpen();
          }
        }, config.resetTimeout);
      }

      throw error;
    }
  }

  private getState(
    key: string,
    config: Required<CircuitBreakerOptions>,
  ): CircuitBreakerState {
    if (!this.states.has(key)) {
      this.states.set(
        key,
        new CircuitBreakerState(
          config.failureThreshold,
          config.resetTimeout,
          config.halfOpenMaxAttempts,
        ),
      );
    }
    return this.states.get(key)!;
  }

  getStatus(key: string): string | null {
    const state = this.states.get(key);
    return state ? state['state'] : null;
  }

  reset(key: string): void {
    this.states.delete(key);
  }

  resetAll(): void {
    this.states.clear();
  }
}