import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrugsModule } from './drugs/drugs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env', '../../.env'], // Check multiple env locations
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL') || 'mongodb://localhost:27017',
        dbName: configService.get<string>('MONGODB_DB_NAME') || 'drug_facts',
      }),
      inject: [ConfigService],
    }),
    DrugsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
