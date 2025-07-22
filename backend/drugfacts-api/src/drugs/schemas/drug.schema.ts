import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DrugDocument = Drug & Document;

@Schema({ collection: 'drugs' })
export class Drug {
  @Prop({ required: true })
  drugName: string;

  @Prop()
  genericName?: string;

  @Prop()
  activeIngredient?: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  setId: string;

  @Prop()
  labeler?: string;

  @Prop()
  manufacturer?: string;

  @Prop()
  therapeuticClass?: string;

  @Prop()
  dea?: string;

  // Label object containing all drug label information
  @Prop({ type: Object })
  label?: {
    boxedWarning?: string;
    warnings?: string;
    warningsAndPrecautions?: string;
    precautions?: string;
    adverseReactions?: string;
    drugInteractions?: string;
    contraindications?: string;
    indicationsAndUsage?: string;
    dosageAndAdministration?: string;
    dosageFormsAndStrengths?: string;
    overdosage?: string;
    description?: string;
    clinicalPharmacology?: string;
    clinicalStudies?: string;
    nonclinicalToxicology?: string;
    nonClinicalToxicology?: string;
    howSupplied?: string;
    useInSpecificPopulations?: string;
    patientCounseling?: string;
    principalDisplayPanel?: string;
    spl?: string;
    mechanismOfAction?: string;
    genericName?: string;
    labelerName?: string;
    productType?: string;
    effectiveTime?: string;
    title?: string;
    highlights?: any;
  };

  // Legacy fields (kept for backward compatibility)
  @Prop()
  boxedWarning?: string;

  @Prop()
  warnings?: string;

  @Prop()
  precautions?: string;

  @Prop()
  adverseReactions?: string;

  @Prop()
  drugInteractions?: string;

  @Prop()
  contraindications?: string;

  @Prop()
  indicationsAndUsage?: string;

  @Prop()
  dosageAndAdministration?: string;

  @Prop()
  overdosage?: string;

  @Prop()
  description?: string;

  @Prop()
  clinicalPharmacology?: string;

  @Prop()
  nonClinicalToxicology?: string;

  @Prop()
  clinicalStudies?: string;

  @Prop()
  howSupplied?: string;

  @Prop()
  patientCounseling?: string;

  @Prop()
  principalDisplayPanel?: string;

  @Prop()
  spl?: string;

  // AI Classification fields
  @Prop({ type: Object })
  aiClassification?: {
    primary_therapeutic_class: string;
    pharmacological_class: string;
    chemical_class: string;
    atc_code: string;
    controlled_substance_schedule: string;
    therapeutic_indication: string;
    mechanism_of_action_summary: string;
    confidence_level: string;
    source_sections_used: string[];
  };

  @Prop({ type: Object })
  aiProcessingMetadata?: {
    processedAt: Date;
    modelUsed: string;
    confidence: string;
    tokensUsed: number;
    processingTimeMs: number;
    cached: boolean;
  };

  // Metadata
  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;

  @Prop()
  _hash?: string;
}

export const DrugSchema = SchemaFactory.createForClass(Drug);