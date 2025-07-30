import { registerAs } from '@nestjs/config';

export default registerAs('cache', () => ({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },
  ttl: {
    default: 3600, // 1 hour
    interactions: 86400, // 24 hours
    drugData: 7200, // 2 hours
  },
}));