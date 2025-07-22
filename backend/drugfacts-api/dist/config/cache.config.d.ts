import * as redisStore from 'cache-manager-redis-store';
declare const _default: (() => {
    store: typeof redisStore;
    host: string;
    port: number;
    password: string | undefined;
    ttl: number;
    max: number;
    isGlobal: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    store: typeof redisStore;
    host: string;
    port: number;
    password: string | undefined;
    ttl: number;
    max: number;
    isGlobal: boolean;
}>;
export default _default;
