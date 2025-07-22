"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            configService.get('FRONTEND_URL', 'http://localhost:3000'),
        ],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const port = configService.get('PORT', 3001);
    await app.listen(port);
    console.log(`NestJS backend is running on: http://localhost:${port}`);
    console.log(`API endpoints available at: http://localhost:${port}/api/drugs`);
}
bootstrap();
//# sourceMappingURL=main.js.map