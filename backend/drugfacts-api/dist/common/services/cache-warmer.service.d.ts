import { OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnhancedRedisCacheService } from './enhanced-redis-cache.service';
export declare class CacheWarmerService implements OnApplicationBootstrap {
    private readonly cacheService;
    private readonly configService;
    private readonly logger;
    private readonly enableWarmup;
    private readonly enableScheduledWarmup;
    constructor(cacheService: EnhancedRedisCacheService, configService: ConfigService);
    onApplicationBootstrap(): Promise<void>;
    scheduledWarmup(): Promise<void>;
    private warmupCache;
    getCacheHealth(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        details: any;
    }>;
}
