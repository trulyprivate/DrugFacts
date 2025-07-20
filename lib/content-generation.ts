import { Drug } from '@/types/drug'

export interface SEOContent {
  title: string
  metaDescription: string
  keywords: string[]
  openGraphTitle: string
  openGraphDescription: string
}

export interface ProviderFriendlyContent {
  patientFriendlyName: string
  whatItTreats: string
  howItWorks: string
  commonSideEffects: string[]
  importantSafetyInfo: string
  whenToCall: string[]
}

export interface FAQSection {
  question: string
  answer: string
  category: 'dosing' | 'safety' | 'usage' | 'side-effects' | 'storage'
}

export interface RelatedContent {
  similarDrugs: Array<{
    name: string
    slug?: string
    relationship: string
    therapeuticClass: string
  }>
  relatedConditions: string[]
  alternativeTreatments: string[]
}

/**
 * Generate SEO-optimized title and meta description based on drug information
 */
export function generateSEOContent(drug: Drug): SEOContent {
  const genericName = drug.label?.genericName || drug.genericName || ''
  const therapeuticClass = drug.therapeuticClass || ''
  const indications = extractPlainText(drug.label?.indicationsAndUsage || drug.indicationsAndUsage || '')
  
  // Extract primary indication for better SEO
  const primaryIndication = extractPrimaryIndication(indications)
  
  const title = `${drug.drugName} (${genericName}) - ${primaryIndication} | drugfacts.wiki`
  
  const metaDescription = `Complete prescribing information for ${drug.drugName} (${genericName}). ${primaryIndication}. Dosing, side effects, contraindications, and clinical studies for healthcare professionals.`
  
  const keywords = [
    drug.drugName.toLowerCase(),
    genericName.toLowerCase(),
    therapeuticClass.toLowerCase(),
    'prescribing information',
    'drug facts',
    'medical information',
    ...extractKeywords(indications)
  ].filter(Boolean)

  return {
    title: title.length > 60 ? `${drug.drugName} (${genericName}) | drugfacts.wiki` : title,
    metaDescription: metaDescription.length > 160 ? metaDescription.substring(0, 157) + '...' : metaDescription,
    keywords,
    openGraphTitle: `${drug.drugName} - Professional Drug Information`,
    openGraphDescription: `${primaryIndication}. Complete prescribing information including dosing, contraindications, and safety data.`
  }
}

/**
 * Create provider-friendly explanations for patients and caregivers
 */
export function generateProviderFriendlyContent(drug: Drug): ProviderFriendlyContent {
  const genericName = drug.label?.genericName || drug.genericName || ''
  const indications = extractPlainText(drug.label?.indicationsAndUsage || drug.indicationsAndUsage || '')
  const adverseReactions = extractPlainText(drug.label?.adverseReactions || drug.adverseReactions || '')
  const warnings = extractPlainText(drug.label?.warningsAndPrecautions || drug.warnings || '')
  const mechanism = extractPlainText(drug.label?.clinicalPharmacology || drug.clinicalPharmacology || '')

  return {
    patientFriendlyName: `${drug.drugName} (${genericName})`,
    whatItTreats: simplifyIndications(indications),
    howItWorks: simplifyMechanism(mechanism, drug.therapeuticClass || ''),
    commonSideEffects: extractCommonSideEffects(adverseReactions),
    importantSafetyInfo: simplifyWarnings(warnings),
    whenToCall: generateWhenToCallDoctor(warnings, adverseReactions)
  }
}

/**
 * Generate FAQ sections from drug label information
 */
export function generateFAQSections(drug: Drug): FAQSection[] {
  const faqs: FAQSection[] = []
  
  // Dosing FAQs
  const dosing = extractPlainText(drug.label?.dosageAndAdministration || drug.dosageAndAdministration || '')
  if (dosing) {
    faqs.push({
      question: `How should ${drug.drugName} be taken?`,
      answer: simplifyDosing(dosing),
      category: 'dosing'
    })
  }

  // Safety FAQs
  const contraindications = extractPlainText(drug.label?.contraindications || drug.contraindications || '')
  if (contraindications) {
    faqs.push({
      question: `Who should not take ${drug.drugName}?`,
      answer: simplifyContraindications(contraindications),
      category: 'safety'
    })
  }

  // Side effects FAQs
  const sideEffects = extractPlainText(drug.label?.adverseReactions || drug.adverseReactions || '')
  if (sideEffects) {
    faqs.push({
      question: `What are the most common side effects of ${drug.drugName}?`,
      answer: simplifySideEffects(sideEffects),
      category: 'side-effects'
    })
  }

  // Storage FAQ
  const storage = extractPlainText(drug.label?.howSupplied || drug.howSupplied || '')
  if (storage) {
    faqs.push({
      question: `How should ${drug.drugName} be stored?`,
      answer: generateStorageInstructions(storage),
      category: 'storage'
    })
  }

  // Usage FAQ
  const indications = extractPlainText(drug.label?.indicationsAndUsage || drug.indicationsAndUsage || '')
  if (indications) {
    faqs.push({
      question: `What conditions does ${drug.drugName} treat?`,
      answer: simplifyIndications(indications),
      category: 'usage'
    })
  }

  return faqs
}

/**
 * Generate related content suggestions
 */
export function generateRelatedContent(drug: Drug, allDrugs: Drug[]): RelatedContent {
  const therapeuticClass = drug.therapeuticClass || ''
  const indications = extractPlainText(drug.label?.indicationsAndUsage || drug.indicationsAndUsage || '')
  
  // Find similar drugs in the same therapeutic class
  const similarDrugs = allDrugs
    .filter(d => d.slug !== drug.slug && d.therapeuticClass === therapeuticClass)
    .slice(0, 4)
    .map(d => ({
      name: d.drugName,
      slug: d.slug,
      relationship: 'Same therapeutic class',
      therapeuticClass: d.therapeuticClass || ''
    }))

  // Extract conditions from indications
  const relatedConditions = extractConditions(indications)
  
  // Generate alternative treatment suggestions based on therapeutic class
  const alternativeTreatments = generateAlternativeTreatments(therapeuticClass)

  return {
    similarDrugs,
    relatedConditions,
    alternativeTreatments
  }
}

// Helper functions
function extractPlainText(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

function extractPrimaryIndication(indications: string): string {
  // Extract the first sentence or main indication
  const sentences = indications.split('.').filter(s => s.trim().length > 10)
  if (sentences.length > 0) {
    let primary = sentences[0].trim()
    // Remove common prefixes
    primary = primary.replace(/^.*is indicated (as an adjunct )?to/, '').trim()
    primary = primary.replace(/^.*is indicated for/, '').trim()
    primary = primary.replace(/^for the treatment of/, '').trim()
    return primary.charAt(0).toUpperCase() + primary.slice(1)
  }
  return 'Drug Information'
}

function extractKeywords(text: string): string[] {
  const commonMedicalTerms = [
    'diabetes', 'hypertension', 'cardiovascular', 'cardiac', 'blood pressure',
    'cholesterol', 'pain', 'infection', 'inflammation', 'depression', 'anxiety',
    'cancer', 'oncology', 'antibiotic', 'antifungal', 'antiviral', 'insulin',
    'hormone', 'thyroid', 'kidney', 'liver', 'heart', 'brain'
  ]
  
  const keywords: string[] = []
  const lowerText = text.toLowerCase()
  
  commonMedicalTerms.forEach(term => {
    if (lowerText.includes(term)) {
      keywords.push(term)
    }
  })
  
  return keywords.slice(0, 8) // Limit to 8 keywords
}

function simplifyIndications(indications: string): string {
  let simplified = indications
    .replace(/^.*is indicated (as an adjunct )?to/, 'Used to')
    .replace(/^.*is indicated for/, 'Used for')
    .replace(/in adults with/, 'in adults who have')
    .replace(/type 2 diabetes mellitus/, 'type 2 diabetes')
  
  return simplified.length > 200 ? simplified.substring(0, 197) + '...' : simplified
}

function simplifyMechanism(mechanism: string, therapeuticClass: string): string {
  if (mechanism.length < 50) {
    // Generate based on therapeutic class if mechanism is too short
    return generateMechanismByClass(therapeuticClass)
  }
  
  let simplified = mechanism
    .replace(/is a \d+-amino-acid/, 'is a')
    .replace(/peptide with a C\d+ fatty/, 'peptide that')
    .replace(/enables albumin binding and prolongs the half-life/, 'helps the medication last longer in your body')
  
  return simplified.length > 300 ? simplified.substring(0, 297) + '...' : simplified
}

function generateMechanismByClass(therapeuticClass: string): string {
  const mechanisms: { [key: string]: string } = {
    'GLP-1': 'Works by mimicking hormones that help control blood sugar levels after meals',
    'ACE Inhibitor': 'Blocks an enzyme that causes blood vessels to narrow, helping to lower blood pressure',
    'Beta Blocker': 'Blocks certain signals to the heart, helping it beat slower and with less force',
    'Diuretic': 'Helps your kidneys remove extra salt and water from your body',
    'Statin': 'Blocks an enzyme your liver uses to make cholesterol',
    'Antibiotic': 'Kills or stops the growth of bacteria causing infection'
  }
  
  for (const [key, value] of Object.entries(mechanisms)) {
    if (therapeuticClass.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }
  
  return 'This medication works by targeting specific pathways in your body to treat your condition.'
}

function extractCommonSideEffects(adverseReactions: string): string[] {
  const text = adverseReactions.toLowerCase()
  const commonEffects = [
    'nausea', 'diarrhea', 'headache', 'dizziness', 'fatigue', 'vomiting',
    'constipation', 'abdominal pain', 'decreased appetite', 'injection site reaction',
    'upper respiratory tract infection', 'nasopharyngitis'
  ]
  
  return commonEffects.filter(effect => text.includes(effect))
    .map(effect => effect.charAt(0).toUpperCase() + effect.slice(1))
    .slice(0, 6)
}

function simplifyWarnings(warnings: string): string {
  let simplified = warnings
    .replace(/patients with a personal or family history of/, 'people with a history of')
    .replace(/medullary thyroid carcinoma/, 'a type of thyroid cancer')
    .replace(/Multiple Endocrine Neoplasia syndrome type 2/, 'certain inherited conditions')
  
  return simplified.length > 250 ? simplified.substring(0, 247) + '...' : simplified
}

function generateWhenToCallDoctor(warnings: string, sideEffects: string): string[] {
  const callReasons = []
  const combinedText = (warnings + ' ' + sideEffects).toLowerCase()
  
  if (combinedText.includes('pancreatitis') || combinedText.includes('abdominal pain')) {
    callReasons.push('Severe stomach pain that does not go away')
  }
  
  if (combinedText.includes('thyroid') || combinedText.includes('neck')) {
    callReasons.push('Lump or swelling in your neck')
  }
  
  if (combinedText.includes('allergic') || combinedText.includes('rash')) {
    callReasons.push('Signs of allergic reaction (rash, swelling, difficulty breathing)')
  }
  
  if (combinedText.includes('kidney') || combinedText.includes('renal')) {
    callReasons.push('Changes in urination or kidney problems')
  }
  
  // Default reasons
  callReasons.push('Any severe or unusual side effects')
  callReasons.push('Questions about your treatment')
  
  return callReasons.slice(0, 5)
}

function simplifyDosing(dosing: string): string {
  return dosing
    .replace(/injected subcutaneously/, 'given as an injection under the skin')
    .replace(/once weekly/, 'once a week')
    .replace(/recommended starting dosage/, 'usual starting dose')
}

function simplifyContraindications(contraindications: string): string {
  return contraindications
    .replace(/is contraindicated in patients with/, 'should not be used by people with')
    .replace(/medullary thyroid carcinoma/, 'certain types of thyroid cancer')
}

function simplifySideEffects(sideEffects: string): string {
  return sideEffects
    .replace(/reported in ≥5% of patients/, 'experienced by 5% or more of people')
    .replace(/treated with/, 'taking')
}

function generateStorageInstructions(storage: string): string {
  if (storage.includes('refrigerat')) {
    return 'Store in the refrigerator. Do not freeze. Keep in original packaging to protect from light.'
  }
  if (storage.includes('room temperature')) {
    return 'Store at room temperature. Keep in a dry place away from heat and light.'
  }
  return 'Follow storage instructions on the package. Keep out of reach of children.'
}

function extractConditions(indications: string): string[] {
  const conditions: string[] = []
  const text = indications.toLowerCase()
  
  const commonConditions = [
    'diabetes', 'hypertension', 'high blood pressure', 'heart disease',
    'cardiovascular disease', 'obesity', 'depression', 'anxiety',
    'high cholesterol', 'infection', 'pain', 'inflammation'
  ]
  
  commonConditions.forEach(condition => {
    if (text.includes(condition)) {
      conditions.push(condition.charAt(0).toUpperCase() + condition.slice(1))
    }
  })
  
  return conditions.slice(0, 4)
}

function generateAlternativeTreatments(therapeuticClass: string): string[] {
  const alternatives: { [key: string]: string[] } = {
    'GLP-1': ['Diet and exercise', 'Metformin', 'Insulin therapy', 'SGLT-2 inhibitors'],
    'ACE Inhibitor': ['ARB medications', 'Beta blockers', 'Calcium channel blockers', 'Diuretics'],
    'Statin': ['Diet modifications', 'Exercise', 'Other cholesterol medications', 'Plant sterols'],
    'Antibiotic': ['Supportive care', 'Other antibiotic classes', 'Probiotics', 'Rest and fluids']
  }
  
  for (const [key, value] of Object.entries(alternatives)) {
    if (therapeuticClass.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }
  
  return ['Lifestyle modifications', 'Other medications', 'Non-drug therapies', 'Consultation with specialist']
}