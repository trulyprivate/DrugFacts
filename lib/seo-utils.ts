/**
 * SEO utility functions for meta tag optimization
 */

/**
 * Truncate text to a maximum length, ensuring it ends at a word boundary
 * and adds ellipsis if truncated
 */
export function truncateDescription(text: string, maxLength: number = 155): string {
  if (!text) return ''
  
  // Remove HTML tags
  const cleanText = text.replace(/<[^>]*>/g, '').trim()
  
  if (cleanText.length <= maxLength) {
    return cleanText
  }
  
  // Truncate at word boundary
  const truncated = cleanText.substring(0, maxLength - 3)
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...'
  }
  
  return truncated + '...'
}

/**
 * Generate SEO-friendly drug description
 */
export function generateDrugDescription(drug: any): string {
  const drugName = drug.drugName
  const genericName = drug.genericName || drug.label?.genericName
  const therapeuticClass = drug.therapeuticClass
  
  // Try to extract key indication
  let indication = ''
  if (drug.label?.indicationsAndUsage || drug.indicationsAndUsage) {
    const indicationText = (drug.label?.indicationsAndUsage || drug.indicationsAndUsage)
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    
    // Extract first meaningful sentence about what it treats
    const match = indicationText.match(/(?:indicated|used|treatment|treat|manage)[^.]+/i)
    if (match) {
      indication = match[0].trim()
    }
  }
  
  // Build description with priority information
  let description = `${drugName}`
  if (genericName && genericName !== drugName) {
    description += ` (${genericName})`
  }
  
  if (indication) {
    description += `: ${indication}`
  } else if (therapeuticClass) {
    description += ` - ${therapeuticClass}`
  }
  
  description += '. FDA-approved prescribing information & dosing.'
  
  return truncateDescription(description, 155)
}

/**
 * Generate homepage meta description
 */
export function generateHomepageDescription(): string {
  return 'FDA-approved drug information database. Search prescribing info, dosing, side effects & interactions for healthcare professionals.'
}

/**
 * Generate static page descriptions
 */
export const staticPageDescriptions = {
  search: 'Search our comprehensive database of FDA-approved medications. Find prescribing information, dosing guidelines & drug interactions.',
  therapeuticClasses: 'Browse medications by therapeutic class. Find drugs for cardiovascular, diabetes, mental health & other medical conditions.',
  manufacturers: 'Find medications by pharmaceutical manufacturer. Browse drugs from Pfizer, Lilly, Merck, J&J and other companies.',
  disclaimer: 'Important medical disclaimer for drugfacts.wiki. Professional use only. Not medical advice. Consult healthcare providers.',
  privacy: 'Privacy policy for drugfacts.wiki. Learn how we protect your data and maintain user privacy while browsing drug information.',
  terms: 'Terms of service for drugfacts.wiki. Guidelines for using our professional drug information database.',
  contact: 'Contact drugfacts.wiki for questions about drug information, technical support, or to report issues with our database.',
  accessibility: 'Accessibility statement for drugfacts.wiki. Our commitment to making drug information available to all users.',
  faq: 'Frequently asked questions about drugfacts.wiki. Learn how to search drugs, understand prescribing info & use our features.',
  performance: 'Performance metrics and optimization details for drugfacts.wiki. Fast, reliable access to drug information.'
}