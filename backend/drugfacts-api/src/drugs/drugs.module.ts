import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DrugsService } from './drugs.service';
import { DrugsController } from './drugs.controller';
import { Drug, DrugSchema } from './schemas/drug.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Drug.name, schema: DrugSchema }]),
  ],
  controllers: [DrugsController],
  providers: [DrugsService],
  exports: [DrugsService],
})
export class DrugsModule {}