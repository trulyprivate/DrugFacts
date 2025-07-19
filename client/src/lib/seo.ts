import { DrugLabel } from "@/types/drug";

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  structuredData: object;
}

export function generateDrugSEO(drug: DrugLabel): SEOMetadata {
  const title = `${drug.label.genericName} (${drug.drugName}) - Complete Prescribing Information | drugfacts.wiki`;
  const description = `Comprehensive prescribing information for ${drug.label.genericName}. Indications, dosing, warnings, and clinical data for healthcare professionals.`;
  const keywords = [
    drug.label.genericName,
    drug.drugName,
    'prescribing information',
    'medication guide',
    'FDA label',
    drug.labeler
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Drug",
    "name": drug.drugName,
    "activeIngredient": drug.label.genericName,
    "manufacturer": {
      "@type": "Organization",
      "name": drug.labeler
    },
    "indication": extractPlainText(drug.label.indicationsAndUsage),
    "contraindication": extractPlainText(drug.label.contraindications),
    "description": `${drug.label.genericName} for subcutaneous injection`
  };

  return {
    title,
    description,
    keywords,
    structuredData
  };
}

function extractPlainText(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
