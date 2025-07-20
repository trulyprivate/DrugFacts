export interface DrugLabel {
  drugName: string;
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
  setId: string;
  therapeuticClass?: string;
  dea?: string;
  manufacturer?: string;
  slug: string;
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
