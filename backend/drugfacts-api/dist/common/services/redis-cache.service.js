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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCacheService = void 0;
const common_1 = require("@nestjs/common");
const memory_cache_service_1 = require("./memory-cache.service");
let RedisCacheService = class RedisCacheService {
    memoryCache;
    constructor(memoryCache) {
        this.memoryCache = memoryCache;
    }
    async get(key) {
        try {
            const result = await this.memoryCache.get(key);
            return result || null;
        }
        catch (error) {
            console.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }
    async set(key, value, ttl) {
        try {
            await this.memoryCache.set(key, value, ttl);
        }
        catch (error) {
            console.error(`Cache set error for key ${key}:`, error);
        }
    }
    async del(key) {
        try {
            await this.memoryCache.del(key);
        }
        catch (error) {
            console.error(`Cache del error for key ${key}:`, error);
        }
    }
    async reset() {
        try {
            await this.memoryCache.flush();
        }
        catch (error) {
            console.error('Cache reset error:', error);
        }
    }
    async wrap(key, fn, ttl) {
        try {
            const cached = await this.get(key);
            if (cached !== null) {
                return cached;
            }
            const result = await fn();
            await this.set(key, result, ttl);
            return result;
        }
        catch (error) {
            console.error(`Cache wrap error for key ${key}:`, error);
            return fn();
        }
    }
};
exports.RedisCacheService = RedisCacheService;
exports.RedisCacheService = RedisCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [memory_cache_service_1.MemoryCacheService])
], RedisCacheService);
//# sourceMappingURL=redis-cache.service.js.map