import { registerAs } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

export default registerAs('cache', () => {
  const config: any = {
    store: redisStore,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    ttl: parseInt(process.env.CACHE_TTL_REDIS || '3600', 10), // 1 hour default
    max: 100,
    isGlobal: true,
  };

  // Add TLS configuration for DigitalOcean Redis
  if (process.env.REDIS_TLS === 'true') {
    config.tls = {
      rejectUnauthorized: false, // DigitalOcean uses self-signed certificates
    };
  }

  return config;
});