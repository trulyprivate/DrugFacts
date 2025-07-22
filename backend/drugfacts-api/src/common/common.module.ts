import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import * as redisStore from 'cache-manager-redis-store';
import { MemoryCacheService } from './services/memory-cache.service';
import { RedisCacheService } from './services/redis-cache.service';
import { EnhancedRedisCacheService } from './services/enhanced-redis-cache.service';
import { CacheWarmerService } from './services/cache-warmer.service';

@Global()
@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get<string>('cache.host', 'localhost');
        const redisPort = configService.get<number>('cache.port', 6379);
        const redisPassword = configService.get<string>('cache.password');
        const redisTTL = configService.get<number>('cache.ttl', 3600);
        
        // Check if Redis is available
        const useRedis = process.env.USE_REDIS === 'true' || process.env.NODE_ENV === 'production';
        
        if (useRedis) {
          return {
            store: redisStore as any,
            host: redisHost,
            port: redisPort,
            password: redisPassword,
            ttl: redisTTL,
            max: 1000, // Maximum number of items in cache
            isGlobal: true,
          } as any;
        }
        
        // Fallback to memory cache for development
        return {
          ttl: redisTTL,
          max: 100,
          isGlobal: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    MemoryCacheService,
    RedisCacheService,
    EnhancedRedisCacheService,
    CacheWarmerService,
  ],
  exports: [
    MemoryCacheService,
    RedisCacheService,
    EnhancedRedisCacheService,
    CacheWarmerService,
    CacheModule,
  ],
})
export class CommonModule {}