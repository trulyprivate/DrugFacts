export interface DrugLabel {
  drugName: string;
  setId: string;
  slug: string;
  labeler: string;
  label: {
    boxedWarning?: string;
    genericName: string;
    labelerName: string;
    productType: string;
    effectiveTime: string;
    title: string;
    indicationsAndUsage: string;
    dosageAndAdministration: string;
    dosageFormsAndStrengths: string;
    warningsAndPrecautions: string;
    adverseReactions: string;
    clinicalPharmacology: string;
    clinicalStudies: string;
    howSupplied: string;
    useInSpecificPopulations: string;
    description: string;
    nonClinicalToxicology: string;
    instructionsForUse: string;
    mechanismOfAction: string;
    contraindications: string;
    highlights: {
      dosageAndAdministration: string;
    };
  };
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
