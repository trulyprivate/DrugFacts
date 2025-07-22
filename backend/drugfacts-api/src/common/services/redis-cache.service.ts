import { Injectable } from '@nestjs/common';
import { MemoryCacheService } from './memory-cache.service';

// Placeholder for Redis cache - in production, you would use actual Redis client
// For now, we'll use memory cache as a fallback
@Injectable()
export class RedisCacheService {
  constructor(private memoryCache: MemoryCacheService) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await this.memoryCache.get<T>(key);
      return result || null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.memoryCache.set(key, value, ttl);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.memoryCache.del(key);
    } catch (error) {
      console.error(`Cache del error for key ${key}:`, error);
    }
  }

  async reset(): Promise<void> {
    try {
      await this.memoryCache.flush();
    } catch (error) {
      console.error('Cache reset error:', error);
    }
  }

  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    try {
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }
      
      const result = await fn();
      await this.set(key, result, ttl);
      return result;
    } catch (error) {
      console.error(`Cache wrap error for key ${key}:`, error);
      return fn();
    }
  }
}