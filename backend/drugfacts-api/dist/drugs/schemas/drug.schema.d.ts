import { Document } from 'mongoose';
export type DrugDocument = Drug & Document;
export declare class Drug {
    drugName: string;
    genericName?: string;
    activeIngredient?: string;
    slug: string;
    setId: string;
    labeler?: string;
    manufacturer?: string;
    therapeuticClass?: string;
    dea?: string;
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
    boxedWarning?: string;
    warnings?: string;
    precautions?: string;
    adverseReactions?: string;
    drugInteractions?: string;
    contraindications?: string;
    indicationsAndUsage?: string;
    dosageAndAdministration?: string;
    overdosage?: string;
    description?: string;
    clinicalPharmacology?: string;
    nonClinicalToxicology?: string;
    clinicalStudies?: string;
    howSupplied?: string;
    patientCounseling?: string;
    principalDisplayPanel?: string;
    spl?: string;
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
    aiProcessingMetadata?: {
        processedAt: Date;
        modelUsed: string;
        confidence: string;
        tokensUsed: number;
        processingTimeMs: number;
        cached: boolean;
    };
    createdAt?: Date;
    updatedAt?: Date;
    _hash?: string;
}
export declare const DrugSchema: import("mongoose").Schema<Drug, import("mongoose").Model<Drug, any, any, any, Document<unknown, any, Drug, any> & Drug & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Drug, Document<unknown, {}, import("mongoose").FlatRecord<Drug>, {}> & import("mongoose").FlatRecord<Drug> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
