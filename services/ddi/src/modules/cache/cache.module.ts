import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: 'redis',
        host: configService.get('cache.redis.host'),
        port: configService.get('cache.redis.port'),
        password: configService.get('cache.redis.password'),
        db: configService.get('cache.redis.db'),
        ttl: configService.get('cache.ttl.default'),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheConfigModule {}