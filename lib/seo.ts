import { DrugLabel } from "@/types/drug";

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  structuredData: object;
}

export function generateDrugSEO(drug: DrugLabel): SEOMetadata {
  const title = `${drug.genericName || drug.drugName} (${drug.drugName}) - Complete Prescribing Information | drugfacts.wiki`;
  const description = `Comprehensive prescribing information for ${drug.genericName || drug.drugName}. Indications, dosing, warnings, and clinical data for healthcare professionals.`;
  const keywords = [
    drug.genericName || '',
    drug.drugName,
    'prescribing information',
    'medication guide',
    'FDA label',
    drug.manufacturer || '',
    drug.therapeuticClass || ''
  ].filter(Boolean);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Drug",
    "name": drug.drugName,
    "activeIngredient": drug.activeIngredient || drug.genericName,
    "manufacturer": {
      "@type": "Organization",
      "name": drug.manufacturer || 'Unknown'
    },
    "indication": drug.indicationsAndUsage ? extractPlainText(drug.indicationsAndUsage) : '',
    "contraindication": drug.contraindications ? extractPlainText(drug.contraindications) : '',
    "description": `${drug.genericName || drug.drugName} - ${drug.therapeuticClass || 'prescription medication'}`
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
