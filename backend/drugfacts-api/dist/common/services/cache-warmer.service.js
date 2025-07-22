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
var CacheWarmerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheWarmerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const enhanced_redis_cache_service_1 = require("./enhanced-redis-cache.service");
let CacheWarmerService = CacheWarmerService_1 = class CacheWarmerService {
    cacheService;
    configService;
    logger = new common_1.Logger(CacheWarmerService_1.name);
    enableWarmup;
    enableScheduledWarmup;
    constructor(cacheService, configService) {
        this.cacheService = cacheService;
        this.configService = configService;
        this.enableWarmup = this.configService.get('CACHE_WARMUP_ON_START', false);
        this.enableScheduledWarmup = this.configService.get('CACHE_SCHEDULED_WARMUP', false);
    }
    async onApplicationBootstrap() {
        if (this.enableWarmup) {
            this.logger.log('Starting cache warmup on application bootstrap');
            await this.warmupCache();
        }
    }
    async scheduledWarmup() {
        if (this.enableScheduledWarmup) {
            this.logger.log('Starting scheduled cache warmup');
            await this.warmupCache();
        }
    }
    async warmupCache() {
        try {
            const startTime = Date.now();
            const warmupTasks = [];
            await Promise.all(warmupTasks);
            const duration = Date.now() - startTime;
            this.logger.log(`Cache warmup completed in ${duration}ms`);
        }
        catch (error) {
            this.logger.error('Cache warmup failed:', error);
        }
    }
    async getCacheHealth() {
        try {
            const stats = await this.cacheService.getStats();
            if (!stats.healthy) {
                return {
                    status: 'unhealthy',
                    details: {
                        message: 'Redis connection is unhealthy',
                        stats,
                    },
                };
            }
            return {
                status: 'healthy',
                details: {
                    message: 'Cache is operating normally',
                    stats,
                },
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                details: {
                    message: 'Failed to get cache stats',
                    error: error.message,
                },
            };
        }
    }
};
exports.CacheWarmerService = CacheWarmerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_3AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CacheWarmerService.prototype, "scheduledWarmup", null);
exports.CacheWarmerService = CacheWarmerService = CacheWarmerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [enhanced_redis_cache_service_1.EnhancedRedisCacheService,
        config_1.ConfigService])
], CacheWarmerService);
//# sourceMappingURL=cache-warmer.service.js.map