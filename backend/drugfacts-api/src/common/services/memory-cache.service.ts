import { Injectable } from '@nestjs/common';
import * as NodeCache from 'node-cache';

@Injectable()
export class MemoryCacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: parseInt(process.env.CACHE_TTL_MEMORY || '300', 10), // 5 minutes default
      checkperiod: 60,
      maxKeys: 1000,
      useClones: false, // For better performance
    });
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (ttl !== undefined) {
      this.cache.set(key, value, ttl);
    } else {
      this.cache.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    this.cache.del(key);
  }

  async flush(): Promise<void> {
    this.cache.flushAll();
  }

  getStats() {
    return this.cache.getStats();
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  getTtl(key: string): number | undefined {
    return this.cache.getTtl(key);
  }
}