"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const helmet_1 = require("helmet");
const express_rate_limit_1 = require("express-rate-limit");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const cache_interceptor_1 = require("./common/interceptors/cache.interceptor");
const sanitize_output_interceptor_1 = require("./common/interceptors/sanitize-output.interceptor");
const validation_pipe_1 = require("./common/pipes/validation.pipe");
const env_validation_1 = require("./config/env.validation");
async function bootstrap() {
    if (!(0, env_validation_1.validateEnv)() && process.env.NODE_ENV === 'production') {
        throw new Error('Environment validation failed. Please check your configuration.');
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    const logger = new common_1.Logger('Bootstrap');
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'none'"],
                frameSrc: ["'none'"],
            },
        },
    }));
    app.use((0, express_rate_limit_1.default)({
        windowMs: configService.get('app.rateLimit.windowMs'),
        max: configService.get('app.rateLimit.max'),
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    }));
    app.enableCors({
        origin: configService.get('app.corsOrigins'),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new cache_interceptor_1.CacheControlInterceptor(), new sanitize_output_interceptor_1.SanitizeOutputInterceptor());
    app.useGlobalPipes(new validation_pipe_1.CustomValidationPipe());
    app.setGlobalPrefix('api', {
        exclude: ['health', 'health/liveness', 'health/readiness'],
    });
    const port = configService.get('app.port');
    await app.listen(port);
    logger.log(`🚀 NestJS backend is running on: http://localhost:${port}`);
    logger.log(`📋 API endpoints available at: http://localhost:${port}/api`);
    logger.log(`❤️  Health check available at: http://localhost:${port}/health`);
    logger.log(`🤖 MCP tools configured for AI integration`);
}
bootstrap().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map