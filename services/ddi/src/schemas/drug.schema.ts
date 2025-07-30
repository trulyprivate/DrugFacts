import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Drug extends Document {
  @Prop({ required: true, index: true })
  rxcui: string;

  @Prop({ required: true, index: true })
  name: string;

  @Prop()
  genericName?: string;

  @Prop([String])
  brandNames: string[];

  @Prop([String])
  activeIngredients: string[];

  @Prop()
  strength?: string;

  @Prop()
  dosageForm?: string;

  @Prop()
  route?: string;

  @Prop([String])
  therapeuticClasses: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastUpdated: Date;
}

export const DrugSchema = SchemaFactory.createForClass(Drug);