import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DrugsService } from './drugs.service';
import { DrugsController } from './drugs.controller';
import { Drug, DrugSchema } from './schemas/drug.schema';
import { DrugsCacheService } from './services/drugs-cache.service';
import { CachedDrugsService } from './cached-drugs.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Drug.name, schema: DrugSchema }]),
    CommonModule,
  ],
  controllers: [DrugsController],
  providers: [DrugsService, DrugsCacheService, CachedDrugsService],
  exports: [DrugsService, DrugsCacheService, CachedDrugsService],
})
export class DrugsModule {}