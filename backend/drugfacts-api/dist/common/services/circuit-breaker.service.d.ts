export interface CircuitBreakerOptions {
    failureThreshold?: number;
    resetTimeout?: number;
    halfOpenMaxAttempts?: number;
}
export declare class CircuitBreakerService {
    private readonly states;
    private readonly defaultOptions;
    call<T>(key: string, fn: () => Promise<T>, options?: CircuitBreakerOptions): Promise<T>;
    private getState;
    getStatus(key: string): string | null;
    reset(key: string): void;
    resetAll(): void;
}
