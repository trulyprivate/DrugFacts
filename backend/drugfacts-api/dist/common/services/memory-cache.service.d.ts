import * as NodeCache from 'node-cache';
export declare class MemoryCacheService {
    private cache;
    constructor();
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    flush(): Promise<void>;
    getStats(): NodeCache.Stats;
    has(key: string): boolean;
    getTtl(key: string): number | undefined;
}
