declare const _default: (() => {
    env: string;
    port: number;
    corsOrigins: string[];
    rateLimit: {
        windowMs: number;
        max: number;
    };
    mcp: {
        port: number;
        host: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    env: string;
    port: number;
    corsOrigins: string[];
    rateLimit: {
        windowMs: number;
        max: number;
    };
    mcp: {
        port: number;
        host: string;
    };
}>;
export default _default;
