import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private configService: ConfigService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const redisUrl = this.configService.get<string>('cache.redis.url');
      
      // Skip check if Redis is not configured
      if (!redisUrl) {
        return this.getStatus(key, true, { message: 'Redis not configured' });
      }

      const client = createClient({
        url: redisUrl,
        password: this.configService.get<string>('cache.redis.password'),
      });

      await client.connect();
      const pong = await client.ping();
      await client.disconnect();

      const isHealthy = pong === 'PONG';

      if (isHealthy) {
        return this.getStatus(key, true);
      }

      throw new Error('Redis health check failed');
    } catch (error) {
      throw new HealthCheckError(
        'Redis health check failed',
        this.getStatus(key, false, { message: error.message }),
      );
    }
  }
}