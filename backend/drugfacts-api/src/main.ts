import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CacheControlInterceptor } from './common/interceptors/cache.interceptor';
import { SanitizeOutputInterceptor } from './common/interceptors/sanitize-output.interceptor';
import { CustomValidationPipe } from './common/pipes/validation.pipe';
import { validateEnv } from './config/env.validation';

async function bootstrap() {
  // Validate environment variables before starting the application
  if (!validateEnv() && process.env.NODE_ENV === 'production') {
    throw new Error('Environment validation failed. Please check your configuration.');
  }
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  // Get config service
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  
  // Security headers
  app.use(helmet({
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
  
  // Rate limiting
  app.use(
    rateLimit({
      windowMs: configService.get('app.rateLimit.windowMs'),
      max: configService.get('app.rateLimit.max'),
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
  
  // Enable CORS
  app.enableCors({
    origin: configService.get('app.corsOrigins'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
  
  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new CacheControlInterceptor(),
    new SanitizeOutputInterceptor(),
  );
  
  // Global validation pipe
  app.useGlobalPipes(new CustomValidationPipe());
  
  // Set global prefix
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
