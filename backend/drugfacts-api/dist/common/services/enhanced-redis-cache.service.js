"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EnhancedRedisCacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedRedisCacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
const zlib = require("zlib");
const util_1 = require("util");
const gzip = (0, util_1.promisify)(zlib.gzip);
const gunzip = (0, util_1.promisify)(zlib.gunzip);
let EnhancedRedisCacheService = EnhancedRedisCacheService_1 = class EnhancedRedisCacheService {
    cacheManager;
    configService;
    logger = new common_1.Logger(EnhancedRedisCacheService_1.name);
    defaultTTL;
    compressionThreshold = 1024;
    keyPrefix = 'drugfacts:';
    connectionHealthy = true;
    constructor(cacheManager, configService) {
        this.cacheManager = cacheManager;
        this.configService = configService;
        this.defaultTTL = this.configService.get('cache.ttl', 3600);
        this.initializeHealthCheck();
    }
    initializeHealthCheck() {
        setInterval(async () => {
            try {
                await this.cacheManager.get('health:check');
                this.connectionHealthy = true;
            }
            catch (error) {
                this.connectionHealthy = false;
                this.logger.error('Redis connection unhealthy:', error);
            }
        }, 30000);
    }
    async onModuleDestroy() {
        try {
            if (this.cacheManager.store && typeof this.cacheManager.store.close === 'function') {
                await this.cacheManager.store.close();
            }
        }
        catch (error) {
            this.logger.error('Error closing cache connection:', error);
        }
    }
    generateKey(key) {
        return `${this.keyPrefix}${key}`;
    }
    hashKey(data) {
        const hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(data));
        return hash.digest('hex').substring(0, 16);
    }
    async compressData(data) {
        const jsonStr = JSON.stringify(data);
        if (jsonStr.length > this.compressionThreshold) {
            try {
                const compressed = await gzip(jsonStr);
                return {
                    compressed: true,
                    data: compressed.toString('base64'),
                };
            }
            catch (error) {
                this.logger.warn('Compression failed, storing uncompressed:', error);
            }
        }
        return { compressed: false, data };
    }
    async decompressData(cachedData) {
        if (cachedData.compressed && typeof cachedData.data === 'string') {
            try {
                const buffer = Buffer.from(cachedData.data, 'base64');
                const decompressed = await gunzip(buffer);
                return JSON.parse(decompressed.toString());
            }
            catch (error) {
                this.logger.error('Decompression failed:', error);
                throw error;
            }
        }
        return cachedData.data;
    }
    async get(key) {
        if (!this.connectionHealthy) {
            return null;
        }
        try {
            const cacheKey = this.generateKey(key);
            const cachedData = await this.cacheManager.get(cacheKey);
            if (!cachedData) {
                return null;
            }
            const data = await this.decompressData(cachedData);
            return data;
        }
        catch (error) {
            this.logger.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }
    async set(key, value, options) {
        if (!this.connectionHealthy) {
            return;
        }
        try {
            const cacheKey = this.generateKey(key);
            const ttl = options?.ttl ?? this.defaultTTL;
            const { compressed, data } = options?.compress !== false
                ? await this.compressData(value)
                : { compressed: false, data: value };
            const cachedData = {
                data,
                compressed,
                timestamp: Date.now(),
                tags: options?.tags,
            };
            await this.cacheManager.set(cacheKey, cachedData, ttl);
            if (options?.tags) {
                for (const tag of options.tags) {
                    await this.addKeyToTag(tag, key, ttl);
                }
            }
        }
        catch (error) {
            this.logger.error(`Cache set error for key ${key}:`, error);
        }
    }
    async del(key) {
        if (!this.connectionHealthy) {
            return;
        }
        try {
            const cacheKey = this.generateKey(key);
            await this.cacheManager.del(cacheKey);
        }
        catch (error) {
            this.logger.error(`Cache del error for key ${key}:`, error);
        }
    }
    async delMany(keys) {
        if (!this.connectionHealthy) {
            return;
        }
        try {
            const cacheKeys = keys.map(key => this.generateKey(key));
            await Promise.all(cacheKeys.map(key => this.cacheManager.del(key)));
        }
        catch (error) {
            this.logger.error('Cache delMany error:', error);
        }
    }
    async invalidateTag(tag) {
        if (!this.connectionHealthy) {
            return;
        }
        try {
            const tagKey = this.generateKey(`tag:${tag}`);
            const keys = await this.cacheManager.get(tagKey);
            if (keys && keys.length > 0) {
                await this.delMany(keys);
                await this.cacheManager.del(tagKey);
            }
        }
        catch (error) {
            this.logger.error(`Tag invalidation error for tag ${tag}:`, error);
        }
    }
    async addKeyToTag(tag, key, ttl) {
        const tagKey = this.generateKey(`tag:${tag}`);
        const keys = await this.cacheManager.get(tagKey) || [];
        if (!keys.includes(key)) {
            keys.push(key);
            await this.cacheManager.set(tagKey, keys, ttl);
        }
    }
    async reset() {
        if (!this.connectionHealthy) {
            return;
        }
        try {
            await this.cacheManager.reset();
        }
        catch (error) {
            this.logger.error('Cache reset error:', error);
        }
    }
    async wrap(key, fn, options) {
        try {
            const cached = await this.get(key);
            if (cached !== null) {
                return cached;
            }
            const result = await fn();
            await this.set(key, result, options);
            return result;
        }
        catch (error) {
            this.logger.error(`Cache wrap error for key ${key}:`, error);
            return fn();
        }
    }
    async mget(keys) {
        if (!this.connectionHealthy) {
            return keys.map(() => null);
        }
        try {
            const cacheKeys = keys.map(key => this.generateKey(key));
            const results = await Promise.all(cacheKeys.map(key => this.cacheManager.get(key)));
            return Promise.all(results.map(async (cachedData) => {
                if (!cachedData)
                    return null;
                return this.decompressData(cachedData);
            }));
        }
        catch (error) {
            this.logger.error('Cache mget error:', error);
            return keys.map(() => null);
        }
    }
    async mset(items) {
        if (!this.connectionHealthy) {
            return;
        }
        try {
            await Promise.all(items.map(({ key, value, options }) => this.set(key, value, options)));
        }
        catch (error) {
            this.logger.error('Cache mset error:', error);
        }
    }
    generateDrugCacheKey(slug, type = 'full') {
        return `drug:${type}:${slug}`;
    }
    generateSearchCacheKey(query, filters) {
        const filterHash = filters ? this.hashKey(filters) : 'none';
        return `search:${this.hashKey(query)}:${filterHash}`;
    }
    generateListCacheKey(type, value) {
        return `list:${type}:${this.hashKey(value)}`;
    }
    async warmupCache(drugSlugs) {
        if (!this.connectionHealthy) {
            return;
        }
        this.logger.log(`Warming up cache for ${drugSlugs.length} drugs`);
    }
    async getStats() {
        if (!this.connectionHealthy) {
            return { healthy: false, keys: 0 };
        }
        try {
            return {
                healthy: this.connectionHealthy,
                keys: 0,
                memory: 'N/A',
            };
        }
        catch (error) {
            this.logger.error('Error getting cache stats:', error);
            return { healthy: false, keys: 0 };
        }
    }
};
exports.EnhancedRedisCacheService = EnhancedRedisCacheService;
exports.EnhancedRedisCacheService = EnhancedRedisCacheService = EnhancedRedisCacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object, config_1.ConfigService])
], EnhancedRedisCacheService);
//# sourceMappingURL=enhanced-redis-cache.service.js.map