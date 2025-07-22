import { Injectable, Inject, Logger, OnModuleDestroy } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

interface CacheOptions {
  ttl?: number;
  compress?: boolean;
  tags?: string[];
}

interface CachedData<T> {
  data: T;
  compressed: boolean;
  timestamp: number;
  tags?: string[];
}

@Injectable()
export class EnhancedRedisCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(EnhancedRedisCacheService.name);
  private readonly defaultTTL: number;
  private readonly compressionThreshold = 1024; // Compress data larger than 1KB
  private readonly keyPrefix = 'drugfacts:';
  private connectionHealthy = true;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.defaultTTL = this.configService.get<number>('cache.ttl', 3600);
    this.initializeHealthCheck();
  }

  private initializeHealthCheck() {
    // Periodic health check for Redis connection
    setInterval(async () => {
      try {
        await this.cacheManager.get('health:check');
        this.connectionHealthy = true;
      } catch (error) {
        this.connectionHealthy = false;
        this.logger.error('Redis connection unhealthy:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  async onModuleDestroy() {
    // Clean up connections if needed
    try {
      if (this.cacheManager.store && typeof (this.cacheManager.store as any).close === 'function') {
        await (this.cacheManager.store as any).close();
      }
    } catch (error) {
      this.logger.error('Error closing cache connection:', error);
    }
  }

  /**
   * Generate cache key with namespace
   */
  private generateKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  /**
   * Generate hash for complex keys
   */
  private hashKey(data: any): string {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(data));
    return hash.digest('hex').substring(0, 16);
  }

  /**
   * Compress data if it exceeds threshold
   */
  private async compressData(data: any): Promise<{ compressed: boolean; data: any }> {
    const jsonStr = JSON.stringify(data);
    
    if (jsonStr.length > this.compressionThreshold) {
      try {
        const compressed = await gzip(jsonStr);
        return {
          compressed: true,
          data: compressed.toString('base64'),
        };
      } catch (error) {
        this.logger.warn('Compression failed, storing uncompressed:', error);
      }
    }
    
    return { compressed: false, data };
  }

  /**
   * Decompress data if needed
   */
  private async decompressData(cachedData: CachedData<any>): Promise<any> {
    if (cachedData.compressed && typeof cachedData.data === 'string') {
      try {
        const buffer = Buffer.from(cachedData.data, 'base64');
        const decompressed = await gunzip(buffer);
        return JSON.parse(decompressed.toString());
      } catch (error) {
        this.logger.error('Decompression failed:', error);
        throw error;
      }
    }
    
    return cachedData.data;
  }

  /**
   * Get value from cache with decompression
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.connectionHealthy) {
      return null;
    }

    try {
      const cacheKey = this.generateKey(key);
      const cachedData = await this.cacheManager.get<CachedData<T>>(cacheKey);
      
      if (!cachedData) {
        return null;
      }

      const data = await this.decompressData(cachedData);
      return data;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with optional compression
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    if (!this.connectionHealthy) {
      return;
    }

    try {
      const cacheKey = this.generateKey(key);
      const ttl = options?.ttl ?? this.defaultTTL;
      
      const { compressed, data } = options?.compress !== false 
        ? await this.compressData(value)
        : { compressed: false, data: value };

      const cachedData: CachedData<T> = {
        data,
        compressed,
        timestamp: Date.now(),
        tags: options?.tags,
      };

      await this.cacheManager.set(cacheKey, cachedData, ttl);

      // Store tag references for invalidation
      if (options?.tags) {
        for (const tag of options.tags) {
          await this.addKeyToTag(tag, key, ttl);
        }
      }
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    if (!this.connectionHealthy) {
      return;
    }

    try {
      const cacheKey = this.generateKey(key);
      await this.cacheManager.del(cacheKey);
    } catch (error) {
      this.logger.error(`Cache del error for key ${key}:`, error);
    }
  }

  /**
   * Delete multiple keys at once
   */
  async delMany(keys: string[]): Promise<void> {
    if (!this.connectionHealthy) {
      return;
    }

    try {
      const cacheKeys = keys.map(key => this.generateKey(key));
      await Promise.all(cacheKeys.map(key => this.cacheManager.del(key)));
    } catch (error) {
      this.logger.error('Cache delMany error:', error);
    }
  }

  /**
   * Invalidate all keys with a specific tag
   */
  async invalidateTag(tag: string): Promise<void> {
    if (!this.connectionHealthy) {
      return;
    }

    try {
      const tagKey = this.generateKey(`tag:${tag}`);
      const keys = await this.cacheManager.get<string[]>(tagKey);
      
      if (keys && keys.length > 0) {
        await this.delMany(keys);
        await this.cacheManager.del(tagKey);
      }
    } catch (error) {
      this.logger.error(`Tag invalidation error for tag ${tag}:`, error);
    }
  }

  /**
   * Add key to tag for bulk invalidation
   */
  private async addKeyToTag(tag: string, key: string, ttl: number): Promise<void> {
    const tagKey = this.generateKey(`tag:${tag}`);
    const keys = await this.cacheManager.get<string[]>(tagKey) || [];
    
    if (!keys.includes(key)) {
      keys.push(key);
      await this.cacheManager.set(tagKey, keys, ttl);
    }
  }

  /**
   * Clear entire cache (use with caution)
   */
  async reset(): Promise<void> {
    if (!this.connectionHealthy) {
      return;
    }

    try {
      await this.cacheManager.reset();
    } catch (error) {
      this.logger.error('Cache reset error:', error);
    }
  }

  /**
   * Wrap function with caching
   */
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    try {
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }
      
      const result = await fn();
      await this.set(key, result, options);
      return result;
    } catch (error) {
      this.logger.error(`Cache wrap error for key ${key}:`, error);
      return fn();
    }
  }

  /**
   * Get multiple values at once
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (!this.connectionHealthy) {
      return keys.map(() => null);
    }

    try {
      const cacheKeys = keys.map(key => this.generateKey(key));
      const results = await Promise.all(
        cacheKeys.map(key => this.cacheManager.get<CachedData<T>>(key))
      );

      return Promise.all(
        results.map(async (cachedData) => {
          if (!cachedData) return null;
          return this.decompressData(cachedData);
        })
      );
    } catch (error) {
      this.logger.error('Cache mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple values at once
   */
  async mset<T>(items: Array<{ key: string; value: T; options?: CacheOptions }>): Promise<void> {
    if (!this.connectionHealthy) {
      return;
    }

    try {
      await Promise.all(
        items.map(({ key, value, options }) => this.set(key, value, options))
      );
    } catch (error) {
      this.logger.error('Cache mset error:', error);
    }
  }

  /**
   * Generate cache key for drug data
   */
  generateDrugCacheKey(slug: string, type: 'full' | 'summary' | 'search' = 'full'): string {
    return `drug:${type}:${slug}`;
  }

  /**
   * Generate cache key for search results
   */
  generateSearchCacheKey(query: string, filters?: any): string {
    const filterHash = filters ? this.hashKey(filters) : 'none';
    return `search:${this.hashKey(query)}:${filterHash}`;
  }

  /**
   * Generate cache key for list data
   */
  generateListCacheKey(type: 'therapeutic' | 'manufacturer', value: string): string {
    return `list:${type}:${this.hashKey(value)}`;
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmupCache(drugSlugs: string[]): Promise<void> {
    if (!this.connectionHealthy) {
      return;
    }

    this.logger.log(`Warming up cache for ${drugSlugs.length} drugs`);
    
    // This would be implemented based on your data fetching logic
    // For now, it's a placeholder for the warming strategy
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    healthy: boolean;
    keys: number;
    memory?: string;
  }> {
    if (!this.connectionHealthy) {
      return { healthy: false, keys: 0 };
    }

    try {
      // This would depend on the Redis client implementation
      // For now, return basic stats
      return {
        healthy: this.connectionHealthy,
        keys: 0, // Would need Redis INFO command
        memory: 'N/A',
      };
    } catch (error) {
      this.logger.error('Error getting cache stats:', error);
      return { healthy: false, keys: 0 };
    }
  }
}