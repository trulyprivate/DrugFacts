import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
export declare class RedisHealthIndicator extends HealthIndicator {
    private configService;
    constructor(configService: ConfigService);
    isHealthy(key: string): Promise<HealthIndicatorResult>;
}
