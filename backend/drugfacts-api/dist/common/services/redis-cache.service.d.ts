import { MemoryCacheService } from './memory-cache.service';
export declare class RedisCacheService {
    private memoryCache;
    constructor(memoryCache: MemoryCacheService);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    reset(): Promise<void>;
    wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T>;
}
