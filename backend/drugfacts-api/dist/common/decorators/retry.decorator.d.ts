export interface RetryOptions {
    maxAttempts?: number;
    backoff?: number;
    maxBackoff?: number;
    exponential?: boolean;
    retryCondition?: (error: any) => boolean;
}
export declare function Retry(options?: RetryOptions): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function RetryOnTimeout(options?: Partial<RetryOptions>): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare function RetryOnDatabaseError(options?: Partial<RetryOptions>): (target: any, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
