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
exports.RedisHealthIndicator = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const config_1 = require("@nestjs/config");
const redis_1 = require("redis");
let RedisHealthIndicator = class RedisHealthIndicator extends terminus_1.HealthIndicator {
    configService;
    constructor(configService) {
        super();
        this.configService = configService;
    }
    async isHealthy(key) {
        try {
            const redisUrl = this.configService.get('cache.redis.url');
            if (!redisUrl) {
                return this.getStatus(key, true, { message: 'Redis not configured' });
            }
            const client = (0, redis_1.createClient)({
                url: redisUrl,
                password: this.configService.get('cache.redis.password'),
            });
            await client.connect();
            const pong = await client.ping();
            await client.disconnect();
            const isHealthy = pong === 'PONG';
            if (isHealthy) {
                return this.getStatus(key, true);
            }
            throw new Error('Redis health check failed');
        }
        catch (error) {
            throw new terminus_1.HealthCheckError('Redis health check failed', this.getStatus(key, false, { message: error.message }));
        }
    }
};
exports.RedisHealthIndicator = RedisHealthIndicator;
exports.RedisHealthIndicator = RedisHealthIndicator = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisHealthIndicator);
//# sourceMappingURL=redis.health.js.map