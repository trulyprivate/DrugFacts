import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminusModule } from '@nestjs/terminus';
import { DrugsModule } from './drugs/drugs.module';
import { HealthModule } from './health/health.module';
import { McpModule } from './mcp/mcp.module';
import { CommonModule } from './common/common.module';
import appConfig from './config/app.config';
import cacheConfig from './config/cache.config';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.docker', '.env.docker.local', '../.env', '../../.env'],
      load: [appConfig, cacheConfig, databaseConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
        dbName: configService.get<string>('database.name'),
      }),
      inject: [ConfigService],
    }),
    TerminusModule,
    CommonModule,
    DrugsModule,
    HealthModule,
    McpModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
