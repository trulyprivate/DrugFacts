"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const redisStore = require("cache-manager-redis-store");
exports.default = (0, config_1.registerAs)('cache', () => ({
    store: redisStore,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    ttl: parseInt(process.env.CACHE_TTL_REDIS || '3600', 10),
    max: 100,
    isGlobal: true,
}));
//# sourceMappingURL=cache.config.js.map