export interface DrugHighlights {
  dosageAndAdministration?: string;
}

export interface DrugLabel {
  drugName: string;
  setId: string;
  slug: string;
  labeler?: string;
  label?: {
    boxedWarning?: string;
    genericName?: string;
    labelerName?: string;
    productType?: string;
    effectiveTime?: string;
    title?: string;
    indicationsAndUsage?: string;
    dosageAndAdministration?: string;
    dosageFormsAndStrengths?: string;
    warningsAndPrecautions?: string;
    adverseReactions?: string;
    clinicalPharmacology?: string;
    clinicalStudies?: string;
    howSupplied?: string;
    useInSpecificPopulations?: string;
    description?: string;
    nonClinicalToxicology?: string;
    instructionsForUse?: string;
    mechanismOfAction?: string;
    contraindications?: string;
    highlights?: DrugHighlights;
  };
  // Legacy fields for backwards compatibility
  genericName?: string;
  activeIngredient?: string;
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
  therapeuticClass?: string;
  dea?: string;
  manufacturer?: string;
  dosageFormsAndStrengths?: string;
  warningsAndPrecautions?: string;
  useInSpecificPopulations?: string;
  instructionsForUse?: string;
  mechanismOfAction?: string;
}

export interface RelatedDrug {
  slug: string;
  name: string;
  genericName: string;
  therapeuticClass: string;
}

export interface DrugSearchResult {
  slug: string;
  drugName: string;
  genericName: string;
  labeler: string;
  indication: string;
}
