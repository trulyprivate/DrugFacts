import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InteractionsModule } from './modules/interactions/interactions.module';
import { CacheConfigModule } from './modules/cache/cache.module';
import { DatabaseInitService } from './services/database-init.service';
import { databaseConfig, cacheConfig, appConfig } from './config';
import { Drug, DrugSchema } from './schemas/drug.schema';
import { DrugInteraction, DrugInteractionSchema } from './schemas/interaction.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, cacheConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ddi-service',
        retryWrites: true,
        w: 'majority',
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        store: 'redis',
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        ttl: 3600, // 1 hour default
      }),
    }),
    MongooseModule.forFeature([
      { name: Drug.name, schema: DrugSchema },
      { name: DrugInteraction.name, schema: DrugInteractionSchema },
    ]),
    InteractionsModule,
    CacheConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseInitService],
})
export class AppModule {}