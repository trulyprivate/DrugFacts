import { DrugLabel } from "@/types/drug";

export function formatEffectiveDate(dateString: string): string {
  if (dateString.length === 8) {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  return dateString;
}

export function stripHTMLTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

export function extractKeyHighlights(drug: DrugLabel): string[] {
  const highlights = [];
  
  if (drug.label.highlights?.dosageAndAdministration) {
    const dosageText = stripHTMLTags(drug.label.highlights.dosageAndAdministration);
    if (dosageText.includes('2.5 mg')) {
      highlights.push('Starting dose: 2.5 mg subcutaneous once weekly');
    }
    if (dosageText.includes('15 mg')) {
      highlights.push('Maintenance: 5-15 mg subcutaneous once weekly');
    }
  }

  if (drug.label.mechanismOfAction?.includes('GIP') && drug.label.mechanismOfAction?.includes('GLP-1')) {
    highlights.push('Dual GIP/GLP-1 receptor agonist');
  }

  if (drug.label.indicationsAndUsage?.includes('type 2 diabetes')) {
    highlights.push('Indicated for Type 2 diabetes mellitus');
  }

  return highlights;
}

export function searchDrugs(query: string, drugs: DrugLabel[]): DrugLabel[] {
  if (!query.trim()) return drugs;
  
  const searchTerm = query.toLowerCase();
  return drugs.filter(drug => 
    drug.drugName.toLowerCase().includes(searchTerm) ||
    drug.label.genericName.toLowerCase().includes(searchTerm) ||
    drug.labeler.toLowerCase().includes(searchTerm) ||
    stripHTMLTags(drug.label.indicationsAndUsage).toLowerCase().includes(searchTerm)
  );
}
