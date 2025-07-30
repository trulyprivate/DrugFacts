import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InteractionsController } from './interactions.controller';
import { InteractionsService } from './interactions.service';
import { DrugInteraction, DrugInteractionSchema } from '../../schemas/interaction.schema';
import { Drug, DrugSchema } from '../../schemas/drug.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DrugInteraction.name, schema: DrugInteractionSchema },
      { name: Drug.name, schema: DrugSchema },
    ]),
  ],
  controllers: [InteractionsController],
  providers: [InteractionsService],
  exports: [InteractionsService],
})
export class InteractionsModule {}