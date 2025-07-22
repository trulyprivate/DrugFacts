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
var CachedDrugsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedDrugsService = void 0;
const common_1 = require("@nestjs/common");
const drugs_service_1 = require("./drugs.service");
const enhanced_redis_cache_service_1 = require("../common/services/enhanced-redis-cache.service");
let CachedDrugsService = CachedDrugsService_1 = class CachedDrugsService {
    drugsService;
    cacheService;
    logger = new common_1.Logger(CachedDrugsService_1.name);
    DRUG_DETAIL_TTL = 3600;
    SEARCH_RESULTS_TTL = 900;
    LIST_DATA_TTL = 7200;
    INDEX_DATA_TTL = 1800;
    constructor(drugsService, cacheService) {
        this.drugsService = drugsService;
        this.cacheService = cacheService;
    }
    async findAll(searchDto) {
        const cacheKey = this.cacheService.generateSearchCacheKey(searchDto.q || 'all', searchDto);
        return this.cacheService.wrap(cacheKey, () => this.drugsService.findAll(searchDto), {
            ttl: this.SEARCH_RESULTS_TTL,
            compress: true,
            tags: ['search', 'drugs'],
        });
    }
    async findBySlug(slug) {
        const cacheKey = this.cacheService.generateDrugCacheKey(slug, 'full');
        return this.cacheService.wrap(cacheKey, () => this.drugsService.findBySlug(slug), {
            ttl: this.DRUG_DETAIL_TTL,
            compress: true,
            tags: ['drug', `drug:${slug}`],
        });
    }
    async getTherapeuticClasses() {
        const cacheKey = 'meta:therapeutic-classes';
        return this.cacheService.wrap(cacheKey, () => this.drugsService.getTherapeuticClasses(), {
            ttl: this.LIST_DATA_TTL,
            compress: false,
            tags: ['meta', 'therapeutic-classes'],
        });
    }
    async getManufacturers() {
        const cacheKey = 'meta:manufacturers';
        return this.cacheService.wrap(cacheKey, () => this.drugsService.getManufacturers(), {
            ttl: this.LIST_DATA_TTL,
            compress: false,
            tags: ['meta', 'manufacturers'],
        });
    }
    async searchByTherapeuticClass(therapeuticClass, page = 1, limit = 50) {
        const cacheKey = this.cacheService.generateListCacheKey('therapeutic', therapeuticClass) +
            `:page:${page}:limit:${limit}`;
        return this.cacheService.wrap(cacheKey, () => this.drugsService.searchByTherapeuticClass(therapeuticClass, page, limit), {
            ttl: this.SEARCH_RESULTS_TTL,
            compress: true,
            tags: ['search', 'therapeutic-class', `tc:${therapeuticClass}`],
        });
    }
    async searchByManufacturer(manufacturer, page = 1, limit = 50) {
        const cacheKey = this.cacheService.generateListCacheKey('manufacturer', manufacturer) +
            `:page:${page}:limit:${limit}`;
        return this.cacheService.wrap(cacheKey, () => this.drugsService.searchByManufacturer(manufacturer, page, limit), {
            ttl: this.SEARCH_RESULTS_TTL,
            compress: true,
            tags: ['search', 'manufacturer', `mfr:${manufacturer}`],
        });
    }
    async count() {
        const cacheKey = 'meta:drug-count';
        return this.cacheService.wrap(cacheKey, () => this.drugsService.count(), {
            ttl: this.LIST_DATA_TTL,
            compress: false,
            tags: ['meta', 'count'],
        });
    }
    async getAllDrugsIndexFormat() {
        const cacheKey = 'index:all-drugs';
        return this.cacheService.wrap(cacheKey, () => this.drugsService.getAllDrugsIndexFormat(), {
            ttl: this.INDEX_DATA_TTL,
            compress: true,
            tags: ['index', 'all-drugs'],
        });
    }
    async findBySlugs(slugs) {
        const cacheKeys = slugs.map(slug => this.cacheService.generateDrugCacheKey(slug, 'full'));
        const cachedResults = await this.cacheService.mget(cacheKeys);
        const toFetch = [];
        cachedResults.forEach((result, index) => {
            if (result === null) {
                toFetch.push({ index, slug: slugs[index] });
            }
        });
        if (toFetch.length > 0) {
            const fetchPromises = toFetch.map(({ slug }) => this.drugsService.findBySlug(slug).catch(() => null));
            const fetchedDrugs = await Promise.all(fetchPromises);
            const cacheItems = toFetch.map((item, idx) => ({
                key: cacheKeys[item.index],
                value: fetchedDrugs[idx],
                options: {
                    ttl: this.DRUG_DETAIL_TTL,
                    compress: true,
                    tags: ['drug', `drug:${item.slug}`],
                },
            })).filter(item => item.value !== null);
            if (cacheItems.length > 0) {
                await this.cacheService.mset(cacheItems);
            }
            toFetch.forEach((item, idx) => {
                cachedResults[item.index] = fetchedDrugs[idx];
            });
        }
        return cachedResults;
    }
    async invalidateDrug(slug) {
        this.logger.log(`Invalidating cache for drug: ${slug}`);
        await this.cacheService.del(this.cacheService.generateDrugCacheKey(slug, 'full'));
        await this.cacheService.invalidateTag(`drug:${slug}`);
    }
    async invalidateSearchCaches() {
        this.logger.log('Invalidating all search caches');
        await this.cacheService.invalidateTag('search');
    }
    async invalidateMetaCaches() {
        this.logger.log('Invalidating all metadata caches');
        await this.cacheService.invalidateTag('meta');
    }
    async warmupCache() {
        this.logger.log('Starting cache warmup');
        try {
            const topDrugs = await this.drugsService.findAll({
                page: 1,
                limit: 20
            });
            const warmupPromises = topDrugs.data.map(drug => this.findBySlug(drug.slug).catch(err => this.logger.error(`Failed to warm up drug ${drug.slug}:`, err)));
            warmupPromises.push(this.getTherapeuticClasses().catch(err => this.logger.error('Failed to warm up therapeutic classes:', err)), this.getManufacturers().catch(err => this.logger.error('Failed to warm up manufacturers:', err)), this.count().catch(err => this.logger.error('Failed to warm up count:', err)));
            await Promise.all(warmupPromises);
            this.logger.log('Cache warmup completed');
        }
        catch (error) {
            this.logger.error('Cache warmup failed:', error);
        }
    }
    async getCacheStats() {
        return this.cacheService.getStats();
    }
};
exports.CachedDrugsService = CachedDrugsService;
exports.CachedDrugsService = CachedDrugsService = CachedDrugsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [drugs_service_1.DrugsService,
        enhanced_redis_cache_service_1.EnhancedRedisCacheService])
], CachedDrugsService);
//# sourceMappingURL=cached-drugs.service.js.map