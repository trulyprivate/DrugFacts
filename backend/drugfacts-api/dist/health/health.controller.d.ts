import { HealthCheckService, MongooseHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health';
export declare class HealthController {
    private health;
    private mongo;
    private memory;
    private redis;
    constructor(health: HealthCheckService, mongo: MongooseHealthIndicator, memory: MemoryHealthIndicator, redis: RedisHealthIndicator);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
    liveness(): Promise<import("@nestjs/terminus").HealthCheckResult>;
    readiness(): Promise<import("@nestjs/terminus").HealthCheckResult>;
    cacheHealth(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
