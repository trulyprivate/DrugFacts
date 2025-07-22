"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const redisStore = require("cache-manager-redis-store");
const memory_cache_service_1 = require("./services/memory-cache.service");
const redis_cache_service_1 = require("./services/redis-cache.service");
const enhanced_redis_cache_service_1 = require("./services/enhanced-redis-cache.service");
const cache_warmer_service_1 = require("./services/cache-warmer.service");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            cache_manager_1.CacheModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const redisHost = configService.get('cache.host', 'localhost');
                    const redisPort = configService.get('cache.port', 6379);
                    const redisPassword = configService.get('cache.password');
                    const redisTTL = configService.get('cache.ttl', 3600);
                    const useRedis = process.env.USE_REDIS === 'true' || process.env.NODE_ENV === 'production';
                    if (useRedis) {
                        return {
                            store: redisStore,
                            host: redisHost,
                            port: redisPort,
                            password: redisPassword,
                            ttl: redisTTL,
                            max: 1000,
                            isGlobal: true,
                        };
                    }
                    return {
                        ttl: redisTTL,
                        max: 100,
                        isGlobal: true,
                    };
                },
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [
            memory_cache_service_1.MemoryCacheService,
            redis_cache_service_1.RedisCacheService,
            enhanced_redis_cache_service_1.EnhancedRedisCacheService,
            cache_warmer_service_1.CacheWarmerService,
        ],
        exports: [
            memory_cache_service_1.MemoryCacheService,
            redis_cache_service_1.RedisCacheService,
            enhanced_redis_cache_service_1.EnhancedRedisCacheService,
            cache_warmer_service_1.CacheWarmerService,
            cache_manager_1.CacheModule,
        ],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map