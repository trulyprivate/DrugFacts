import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EnhancedRedisCacheService } from './enhanced-redis-cache.service';

@Injectable()
export class CacheWarmerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CacheWarmerService.name);
  private readonly enableWarmup: boolean;
  private readonly enableScheduledWarmup: boolean;

  constructor(
    private readonly cacheService: EnhancedRedisCacheService,
    private readonly configService: ConfigService,
  ) {
    this.enableWarmup = this.configService.get<boolean>('CACHE_WARMUP_ON_START', false);
    this.enableScheduledWarmup = this.configService.get<boolean>('CACHE_SCHEDULED_WARMUP', false);
  }

  async onApplicationBootstrap() {
    if (this.enableWarmup) {
      this.logger.log('Starting cache warmup on application bootstrap');
      await this.warmupCache();
    }
  }

  /**
   * Run cache warmup every day at 3 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async scheduledWarmup() {
    if (this.enableScheduledWarmup) {
      this.logger.log('Starting scheduled cache warmup');
      await this.warmupCache();
    }
  }

  /**
   * Warm up cache with frequently accessed data
   */
  private async warmupCache() {
    try {
      const startTime = Date.now();
      
      // This is where you'd inject your services and warm up specific data
      // For now, it's a placeholder showing the pattern
      
      const warmupTasks = [
        // Example: this.cacheService.set('popular:drugs', await this.drugsService.getPopularDrugs()),
        // Example: this.cacheService.set('therapeutic:classes', await this.drugsService.getTherapeuticClasses()),
      ];

      await Promise.all(warmupTasks);
      
      const duration = Date.now() - startTime;
      this.logger.log(`Cache warmup completed in ${duration}ms`);
    } catch (error) {
      this.logger.error('Cache warmup failed:', error);
    }
  }

  /**
   * Get cache health metrics
   */
  async getCacheHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }> {
    try {
      const stats = await this.cacheService.getStats();
      
      if (!stats.healthy) {
        return {
          status: 'unhealthy',
          details: {
            message: 'Redis connection is unhealthy',
            stats,
          },
        };
      }

      return {
        status: 'healthy',
        details: {
          message: 'Cache is operating normally',
          stats,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          message: 'Failed to get cache stats',
          error: error.message,
        },
      };
    }
  }
}