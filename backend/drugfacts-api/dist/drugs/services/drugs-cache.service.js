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
exports.DrugsCacheService = void 0;
const common_1 = require("@nestjs/common");
const memory_cache_service_1 = require("../../common/services/memory-cache.service");
const redis_cache_service_1 = require("../../common/services/redis-cache.service");
const drugs_service_1 = require("../drugs.service");
let DrugsCacheService = class DrugsCacheService {
    memoryCache;
    redisCache;
    drugsService;
    CACHE_PREFIX = 'drug:';
    SEARCH_PREFIX = 'search:';
    LIST_PREFIX = 'list:';
    constructor(memoryCache, redisCache, drugsService) {
        this.memoryCache = memoryCache;
        this.redisCache = redisCache;
        this.drugsService = drugsService;
    }
    async getDrugBySlug(slug) {
        const cacheKey = `${this.CACHE_PREFIX}${slug}`;
        const memCached = await this.memoryCache.get(cacheKey);
        if (memCached) {
            return memCached;
        }
        const redisCached = await this.redisCache.get(cacheKey);
        if (redisCached) {
            await this.memoryCache.set(cacheKey, redisCached, 300);
            return redisCached;
        }
        const drug = await this.drugsService.findBySlug(slug);
        await this.redisCache.set(cacheKey, drug, 3600);
        await this.memoryCache.set(cacheKey, drug, 300);
        return drug;
    }
    async searchDrugs(searchDto) {
        const cacheKey = `${this.SEARCH_PREFIX}${JSON.stringify({
            q: searchDto.q,
            therapeuticClass: searchDto.therapeuticClass,
            manufacturer: searchDto.manufacturer,
            page: searchDto.page,
            limit: searchDto.limit,
            searchType: searchDto.searchType,
        })}`;
        const memCached = await this.memoryCache.get(cacheKey);
        if (memCached) {
            return memCached;
        }
        const redisCached = await this.redisCache.get(cacheKey);
        if (redisCached) {
            await this.memoryCache.set(cacheKey, redisCached, 60);
            return redisCached;
        }
        const result = await this.drugsService.findAll(searchDto);
        const redisTTL = searchDto.searchType === 'text' ? 600 : 300;
        const memoryTTL = searchDto.searchType === 'text' ? 120 : 60;
        await this.redisCache.set(cacheKey, result, redisTTL);
        await this.memoryCache.set(cacheKey, result, memoryTTL);
        return result;
    }
    async getTherapeuticClasses() {
        const cacheKey = `${this.LIST_PREFIX}therapeutic-classes`;
        const memCached = await this.memoryCache.get(cacheKey);
        if (memCached) {
            return memCached;
        }
        const redisCached = await this.redisCache.get(cacheKey);
        if (redisCached) {
            await this.memoryCache.set(cacheKey, redisCached, 3600);
            return redisCached;
        }
        const classes = await this.drugsService.getTherapeuticClasses();
        await this.redisCache.set(cacheKey, classes, 86400);
        await this.memoryCache.set(cacheKey, classes, 3600);
        return classes;
    }
    async getManufacturers() {
        const cacheKey = `${this.LIST_PREFIX}manufacturers`;
        return this.redisCache.wrap(cacheKey, async () => {
            const manufacturers = await this.drugsService.getManufacturers();
            await this.memoryCache.set(cacheKey, manufacturers, 3600);
            return manufacturers;
        }, 86400);
    }
    async invalidateDrug(slug) {
        const cacheKey = `${this.CACHE_PREFIX}${slug}`;
        await Promise.all([
            this.memoryCache.del(cacheKey),
            this.redisCache.del(cacheKey),
        ]);
    }
    async invalidateSearchCache() {
        await this.memoryCache.flush();
        await this.redisCache.reset();
    }
    async invalidateListCache() {
        const keys = [
            `${this.LIST_PREFIX}therapeutic-classes`,
            `${this.LIST_PREFIX}manufacturers`,
        ];
        await Promise.all(keys.flatMap(key => [
            this.memoryCache.del(key),
            this.redisCache.del(key),
        ]));
    }
    async warmCache() {
        await Promise.all([
            this.getTherapeuticClasses(),
            this.getManufacturers(),
        ]);
    }
};
exports.DrugsCacheService = DrugsCacheService;
exports.DrugsCacheService = DrugsCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [memory_cache_service_1.MemoryCacheService,
        redis_cache_service_1.RedisCacheService,
        drugs_service_1.DrugsService])
], DrugsCacheService);
//# sourceMappingURL=drugs-cache.service.js.map