import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Drug } from './drug.schema';

export enum SeverityLevel {
  MINOR = 'minor',
  MODERATE = 'moderate',
  MAJOR = 'major',
  CONTRAINDICATED = 'contraindicated',
}

export enum MechanismType {
  PHARMACOKINETIC = 'pharmacokinetic',
  PHARMACODYNAMIC = 'pharmacodynamic',
  UNKNOWN = 'unknown',
}

@Schema()
export class Reference {
  @Prop({ required: true })
  title: string;

  @Prop()
  authors: string;

  @Prop()
  journal: string;

  @Prop()
  year: number;

  @Prop()
  pmid: string;

  @Prop()
  url: string;
}

const ReferenceSchema = SchemaFactory.createForClass(Reference);

@Schema({ timestamps: true })
export class DrugInteraction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Drug', required: true })
  drug1: Drug;

  @Prop({ type: Types.ObjectId, ref: 'Drug', required: true })
  drug2: Drug;

  @Prop({ 
    required: true, 
    enum: Object.values(SeverityLevel),
    index: true 
  })
  severity: SeverityLevel;

  @Prop({ 
    required: true, 
    enum: Object.values(MechanismType) 
  })
  mechanism: MechanismType;

  @Prop({ required: true })
  description: string;

  @Prop()
  management: string;

  @Prop()
  clinicalEvidence: string;

  @Prop([ReferenceSchema])
  references: Reference[];

  @Prop({ default: Date.now })
  lastUpdated: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  sourceSystem: string;

  @Prop()
  sourceId: string;
}

export const DrugInteractionSchema = SchemaFactory.createForClass(DrugInteraction);

// Create compound index for efficient lookups
DrugInteractionSchema.index({ drug1: 1, drug2: 1 });
DrugInteractionSchema.index({ severity: 1, isActive: 1 });