import { OnModuleDestroy } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
interface CacheOptions {
    ttl?: number;
    compress?: boolean;
    tags?: string[];
}
export declare class EnhancedRedisCacheService implements OnModuleDestroy {
    private cacheManager;
    private configService;
    private readonly logger;
    private readonly defaultTTL;
    private readonly compressionThreshold;
    private readonly keyPrefix;
    private connectionHealthy;
    constructor(cacheManager: Cache, configService: ConfigService);
    private initializeHealthCheck;
    onModuleDestroy(): Promise<void>;
    private generateKey;
    private hashKey;
    private compressData;
    private decompressData;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
    del(key: string): Promise<void>;
    delMany(keys: string[]): Promise<void>;
    invalidateTag(tag: string): Promise<void>;
    private addKeyToTag;
    reset(): Promise<void>;
    wrap<T>(key: string, fn: () => Promise<T>, options?: CacheOptions): Promise<T>;
    mget<T>(keys: string[]): Promise<(T | null)[]>;
    mset<T>(items: Array<{
        key: string;
        value: T;
        options?: CacheOptions;
    }>): Promise<void>;
    generateDrugCacheKey(slug: string, type?: 'full' | 'summary' | 'search'): string;
    generateSearchCacheKey(query: string, filters?: any): string;
    generateListCacheKey(type: 'therapeutic' | 'manufacturer', value: string): string;
    warmupCache(drugSlugs: string[]): Promise<void>;
    getStats(): Promise<{
        healthy: boolean;
        keys: number;
        memory?: string;
    }>;
}
export {};
