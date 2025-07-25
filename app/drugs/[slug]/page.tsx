import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDrugBySlug, getAllDrugs } from '@/lib/drugs'
import DrugHeader from '@/components/drug/DrugHeader'
import CollapsibleSection from '@/components/drug/CollapsibleSection'
import ProviderFriendlySection from '@/components/drug/ProviderFriendlySection'
import FAQSection from '@/components/drug/FAQSection'
import RelatedContentSection from '@/components/drug/RelatedContentSection'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { 
  generateSEOContent, 
  generateProviderFriendlyContent, 
  generateFAQSections, 
  generateRelatedContent 
} from '@/lib/content-generation'
import { generateDrugDescription } from '@/lib/seo-utils'

export async function generateStaticParams() {
  try {
    // Try to get drugs from the main service (MongoDB or JSON fallback)
    const drugs = await getAllDrugs()
    
    if (drugs && drugs.length > 0) {
      return drugs.map((drug) => ({
        slug: drug.slug,
      }))
    }
  } catch (error) {
    console.warn('Failed to get drugs from main service, falling back to JSON:', error)
  }

  // Fallback to reading JSON files directly for static generation
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    
    const drugsDir = path.join(process.cwd(), 'data', 'drugs')
    const indexPath = path.join(drugsDir, 'index.json')
    
    const data = await fs.readFile(indexPath, 'utf-8')
    const drugs = JSON.parse(data)
    
    return drugs.map((drug: any) => ({
      slug: drug.slug,
    }))
  } catch (fallbackError) {
    console.error('Failed to read drugs from JSON fallback:', fallbackError)
    
    // Return empty array as last resort - this will cause build to fail for missing params
    // but won't crash the build process
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const drug = await getDrugBySlug(slug)
  if (!drug) return {}

  // Generate enhanced SEO content
  const seoContent = generateSEOContent(drug)

  const title = `${drug.drugName} (${drug.genericName || drug.label?.genericName || 'Rx'}) - Prescribing Information | drugfacts.wiki`
  const description = generateDrugDescription(drug)

  return {
    title,
    description,
    keywords: [
      drug.drugName,
      drug.genericName || drug.label?.genericName,
      drug.therapeuticClass,
      'prescribing information',
      'FDA label',
      'drug information',
      ...seoContent.keywords
    ].filter(Boolean).join(', '),
    authors: [{ name: 'drugfacts.wiki' }],
    alternates: {
      canonical: `https://drugfacts.wiki/drugs/${drug.slug}/`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      siteName: 'drugfacts.wiki',
      url: `https://drugfacts.wiki/drugs/${drug.slug}/`,
      locale: 'en_US',
      images: [
        {
          url: '/og-image.png',
          width: 512,
          height: 512,
          alt: `${drug.drugName} - Comprehensive Drug Information`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@drugfactswiki',
      creator: '@drugfactswiki',
      images: ['/og-image.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'og:drug:generic_name': drug.genericName || drug.label?.genericName || '',
      'og:drug:therapeutic_class': drug.therapeuticClass || '',
      'og:drug:manufacturer': drug.manufacturer || drug.labeler || drug.label?.labelerName || '',
      'og:drug:dea_schedule': drug.dea || '',
    },
  }
}

export default async function DrugDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  let drug
  try {
    drug = await getDrugBySlug(slug)
  } catch (error) {
    console.error(`Error fetching drug with slug ${slug}:`, error)
    // Try fallback to JSON file directly
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      const filePath = path.join(process.cwd(), 'data', 'drugs', `${slug}.json`)
      const data = await fs.readFile(filePath, 'utf-8')
      drug = JSON.parse(data)
    } catch (fallbackError) {
      console.error(`Fallback also failed for ${slug}:`, fallbackError)
      drug = null
    }
  }
  
  if (!drug) {
    notFound()
  }

  // Get all drugs for related content generation
  const allDrugs = await getAllDrugs()
  const relatedDrugs = allDrugs
    .filter(d => d.slug !== drug.slug && d.therapeuticClass === drug.therapeuticClass)
    .slice(0, 5)

  // Generate enhanced content
  const providerFriendlyContent = generateProviderFriendlyContent(drug)
  const faqSections = generateFAQSections(drug)
  const relatedContent = generateRelatedContent(drug, allDrugs)

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Drug",
    name: drug.drugName,
    nonProprietaryName: drug.genericName || drug.label?.genericName,
    activeIngredient: drug.activeIngredient,
    manufacturer: {
      "@type": "Organization",
      name: drug.manufacturer || drug.labeler || drug.label?.labelerName
    },
    description: drug.description || drug.label?.description || `Comprehensive prescribing information for ${drug.drugName}`,
    prescribingInfo: drug.label?.indicationsAndUsage || drug.indicationsAndUsage,
    warning: drug.boxedWarning || drug.label?.boxedWarning,
    contraindication: drug.contraindications || drug.label?.contraindications,
    dosageForm: drug.label?.dosageFormsAndStrengths || drug.dosageFormsAndStrengths,
    administrationRoute: drug.label?.dosageAndAdministration || drug.dosageAndAdministration,
    adverseEffect: drug.adverseReactions || drug.label?.adverseReactions,
    clinicalPharmacology: drug.clinicalPharmacology || drug.label?.clinicalPharmacology,
    mechanismOfAction: drug.label?.mechanismOfAction || drug.mechanismOfAction,
    drugClass: drug.therapeuticClass,
    medicineSystem: "https://www.fda.gov",
    url: `https://drugfacts.wiki/drugs/${drug.slug}/`,
    identifier: drug.setId,
    ...(drug.dea && { legalStatus: `DEA Schedule ${drug.dea}` })
  }

  // Generate FAQ structured data
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqSections.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  }

  // Generate BreadcrumbList structured data
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://drugfacts.wiki"
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Drugs",
        item: "https://drugfacts.wiki/drugs"
      },
      {
        "@type": "ListItem",
        position: 3,
        name: drug.drugName,
        item: `https://drugfacts.wiki/drugs/${drug.slug}/`
      }
    ]
  }

  // Generate MedicalWebPage structured data
  const medicalWebPageData = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: `${drug.drugName} - Prescribing Information`,
    description: `Comprehensive FDA-approved prescribing information for ${drug.drugName}${drug.genericName ? ` (${drug.genericName})` : ''}`,
    url: `https://drugfacts.wiki/drugs/${drug.slug}/`,
    about: {
      "@type": "Drug",
      name: drug.drugName
    },
    medicalAudience: {
      "@type": "MedicalAudience",
      audienceType: "Healthcare professionals"
    },
    lastReviewed: drug.label?.effectiveTime && !isNaN(Date.parse(drug.label.effectiveTime)) 
      ? new Date(drug.label.effectiveTime).toISOString() 
      : new Date().toISOString(),
    specialty: drug.therapeuticClass,
    publisher: {
      "@type": "Organization",
      name: "drugfacts.wiki",
      url: "https://drugfacts.wiki"
    }
  }

  return (
    <>
      {/* Structured Data Scripts for SEO - Using inline script tags for better SSR */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(medicalWebPageData)
        }}
      />
      
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
          <DrugHeader drug={drug} />
          
          <Tabs defaultValue="professional" className="mt-4 sm:mt-6">
            <TabsList className="flex w-full h-auto p-1 bg-gray-100 border border-gray-200 rounded-lg">
              <TabsTrigger 
                value="professional" 
                className="text-xs sm:text-sm px-4 sm:px-6 py-3 text-center font-medium transition-all duration-200 
                          data-[state=active]:!bg-gray-600 data-[state=active]:!text-white data-[state=active]:!border-gray-600 data-[state=active]:shadow-md
                          data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:hover:bg-gray-50
                          rounded-lg border border-transparent flex-1 relative"
              >
                <span className="block sm:hidden">Professional</span>
                <span className="hidden sm:block">Professional Info</span>
              </TabsTrigger>
              <TabsTrigger 
                value="patient" 
                className="text-xs sm:text-sm px-4 sm:px-6 py-3 text-center font-medium transition-all duration-200
                          data-[state=active]:!bg-gray-600 data-[state=active]:!text-white data-[state=active]:!border-gray-600 data-[state=active]:shadow-md
                          data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:hover:bg-gray-50
                          rounded-lg border border-transparent flex-1 relative"
              >
                <span className="block sm:hidden">Patient</span>
                <span className="hidden sm:block">Patient-Friendly</span>
              </TabsTrigger>
              <TabsTrigger 
                value="faq" 
                className="text-xs sm:text-sm px-4 sm:px-6 py-3 text-center font-medium transition-all duration-200
                          data-[state=active]:!bg-gray-600 data-[state=active]:!text-white data-[state=active]:!border-gray-600 data-[state=active]:shadow-md
                          data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-700 data-[state=inactive]:hover:bg-gray-50
                          rounded-lg border border-transparent flex-1 relative"
              >
                <span className="block sm:hidden">FAQ</span>
                <span className="hidden sm:block">FAQ & Related</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="professional" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {/* Highlights section from schema */}
            {(drug.label?.highlights?.dosageAndAdministration || drug.dosageAndAdministration) && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-1">
                <CollapsibleSection 
                  id="highlights"
                  title="HIGHLIGHTS" 
                  defaultExpanded={true}
                >
                  <div className="prose max-w-none">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Dosage and Administration Highlights</h4>
                    <div dangerouslySetInnerHTML={{ 
                      __html: drug.label?.highlights?.dosageAndAdministration || drug.dosageAndAdministration || '' 
                    }} />
                  </div>
                </CollapsibleSection>
              </div>
            )}

            {/* Boxed Warning */}
            {drug.boxedWarning && (
              <div className="border-2 border-red-500 bg-red-50 rounded-lg p-1">
                <CollapsibleSection 
                  id="boxed-warning"
                  title="BOXED WARNING" 
                  defaultExpanded={true}
                >
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: drug.boxedWarning }} />
                </CollapsibleSection>
              </div>
            )}

            {/* Title (from schema) */}
            {drug.label?.title && (
              <CollapsibleSection id="title" title="FULL PRESCRIBING INFORMATION">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: drug.label.title }} />
              </CollapsibleSection>
            )}

            {/* Indications and Usage - Critical Information */}
            {(drug.label?.indicationsAndUsage || drug.indicationsAndUsage) && (
              <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-1">
                <CollapsibleSection id="indications" title="INDICATIONS AND USAGE" defaultExpanded={true}>
                  <div className="bg-white p-4 rounded">
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                      __html: drug.label?.indicationsAndUsage || drug.indicationsAndUsage || '' 
                    }} />
                  </div>
                </CollapsibleSection>
              </div>
            )}

            {/* Dosage and Administration - Critical Information */}
            {(drug.label?.dosageAndAdministration || drug.dosageAndAdministration) && (
              <div className="border-2 border-green-300 bg-green-50 rounded-lg p-1">
                <CollapsibleSection id="dosage" title="DOSAGE AND ADMINISTRATION" defaultExpanded={true}>
                  <div className="bg-white p-4 rounded">
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                      __html: drug.label?.dosageAndAdministration || drug.dosageAndAdministration || '' 
                    }} />
                  </div>
                </CollapsibleSection>
              </div>
            )}

            {/* Dosage Forms and Strengths (from schema) */}
            {(drug.label?.dosageFormsAndStrengths || drug.dosageFormsAndStrengths) && (
              <CollapsibleSection id="dosage-forms" title="DOSAGE FORMS AND STRENGTHS">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                  __html: drug.label?.dosageFormsAndStrengths || drug.dosageFormsAndStrengths || '' 
                }} />
              </CollapsibleSection>
            )}

            {/* Contraindications - Critical Information */}
            {(drug.label?.contraindications || drug.contraindications) && (
              <div className="border-2 border-red-300 bg-red-50 rounded-lg p-1">
                <CollapsibleSection id="contraindications" title="CONTRAINDICATIONS" defaultExpanded={true}>
                  <div className="bg-white p-4 rounded">
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                      __html: drug.label?.contraindications || drug.contraindications || '' 
                    }} />
                  </div>
                </CollapsibleSection>
              </div>
            )}

            {/* Warnings and Precautions - Critical Information */}
            {(drug.label?.warningsAndPrecautions || drug.warnings || drug.warningsAndPrecautions) && (
              <div className="border-2 border-orange-300 bg-orange-50 rounded-lg p-1">
                <CollapsibleSection id="warnings" title="WARNINGS AND PRECAUTIONS" defaultExpanded={true}>
                  <div className="bg-white p-4 rounded">
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                      __html: drug.label?.warningsAndPrecautions || drug.warnings || drug.warningsAndPrecautions || '' 
                    }} />
                  </div>
                </CollapsibleSection>
              </div>
            )}

            {/* Adverse Reactions */}
            {(drug.label?.adverseReactions || drug.adverseReactions) && (
              <CollapsibleSection id="adverse-reactions" title="ADVERSE REACTIONS">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                  __html: drug.label?.adverseReactions || drug.adverseReactions || '' 
                }} />
              </CollapsibleSection>
            )}

            {/* Drug Interactions */}
            {drug.drugInteractions && (
              <CollapsibleSection id="drug-interactions" title="DRUG INTERACTIONS">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: drug.drugInteractions }} />
              </CollapsibleSection>
            )}

            {/* Use in Specific Populations (from schema) */}
            {(drug.label?.useInSpecificPopulations || drug.useInSpecificPopulations) && (
              <CollapsibleSection id="specific-populations" title="USE IN SPECIFIC POPULATIONS">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                  __html: drug.label?.useInSpecificPopulations || drug.useInSpecificPopulations || '' 
                }} />
              </CollapsibleSection>
            )}

            {/* Clinical Pharmacology */}
            {(drug.label?.clinicalPharmacology || drug.clinicalPharmacology) && (
              <CollapsibleSection id="clinical-pharmacology" title="CLINICAL PHARMACOLOGY">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                  __html: drug.label?.clinicalPharmacology || drug.clinicalPharmacology || '' 
                }} />
              </CollapsibleSection>
            )}

            {/* Mechanism of Action (from schema) */}
            {(drug.label?.mechanismOfAction || drug.mechanismOfAction) && (
              <CollapsibleSection id="mechanism-of-action" title="MECHANISM OF ACTION">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                  __html: drug.label?.mechanismOfAction || drug.mechanismOfAction || '' 
                }} />
              </CollapsibleSection>
            )}

            {/* Nonclinical Toxicology (from schema) */}
            {(drug.label?.nonClinicalToxicology || drug.nonClinicalToxicology) && (
              <CollapsibleSection id="nonclinical-toxicology" title="NONCLINICAL TOXICOLOGY">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                  __html: drug.label?.nonClinicalToxicology || drug.nonClinicalToxicology || '' 
                }} />
              </CollapsibleSection>
            )}

            {/* Clinical Studies */}
            {(drug.label?.clinicalStudies || drug.clinicalStudies) && (
              <CollapsibleSection id="clinical-studies" title="CLINICAL STUDIES">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                  __html: drug.label?.clinicalStudies || drug.clinicalStudies || '' 
                }} />
              </CollapsibleSection>
            )}

            {/* Description */}
            {(drug.label?.description || drug.description) && (
              <CollapsibleSection id="description" title="DESCRIPTION">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                  __html: drug.label?.description || drug.description || '' 
                }} />
              </CollapsibleSection>
            )}

            {/* How Supplied */}
            {(drug.label?.howSupplied || drug.howSupplied) && (
              <CollapsibleSection id="how-supplied" title="HOW SUPPLIED/STORAGE AND HANDLING">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                  __html: drug.label?.howSupplied || drug.howSupplied || '' 
                }} />
              </CollapsibleSection>
            )}

            {/* Instructions for Use (from schema) */}
            {(drug.label?.instructionsForUse || drug.instructionsForUse) && (
              <CollapsibleSection id="instructions-for-use" title="INSTRUCTIONS FOR USE">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                  __html: drug.label?.instructionsForUse || drug.instructionsForUse || '' 
                }} />
              </CollapsibleSection>
            )}

            {/* Patient Counseling Information */}
            {drug.patientCounseling && (
              <CollapsibleSection id="patient-counseling" title="PATIENT COUNSELING INFORMATION">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: drug.patientCounseling }} />
              </CollapsibleSection>
            )}

            {/* Overdosage */}
            {drug.overdosage && (
              <CollapsibleSection id="overdosage" title="OVERDOSAGE">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: drug.overdosage }} />
              </CollapsibleSection>
            )}

            {/* Principal Display Panel */}
            {drug.principalDisplayPanel && (
              <CollapsibleSection id="principal-display-panel" title="PRINCIPAL DISPLAY PANEL">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: drug.principalDisplayPanel }} />
              </CollapsibleSection>
            )}
            </TabsContent>

            <TabsContent value="patient" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              <ProviderFriendlySection content={providerFriendlyContent} />
            </TabsContent>

            <TabsContent value="faq" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              <FAQSection faqs={faqSections} drugName={drug.drugName} />
              <RelatedContentSection content={relatedContent} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4 sm:p-6 sticky top-4 sm:top-8">
            <h3 className="font-semibold mb-4">Drug Information</h3>
            <dl className="space-y-3 text-sm">
              {/* Drug Name (schema required) */}
              <dt className="text-gray-600">Drug Name</dt>
              <dd className="font-medium">{drug.drugName}</dd>

              {/* Generic Name (schema field) */}
              {(drug.label?.genericName || drug.genericName) && (
                <>
                  <dt className="text-gray-600 mt-3">Generic Name</dt>
                  <dd className="font-medium">{drug.label?.genericName || drug.genericName}</dd>
                </>
              )}

              {/* Set ID (schema required) */}
              <dt className="text-gray-600 mt-3">Set ID</dt>
              <dd className="font-medium font-mono text-xs">{drug.setId}</dd>

              {/* Labeler (schema field) */}
              {(drug.labeler || drug.label?.labelerName || drug.manufacturer) && (
                <>
                  <dt className="text-gray-600 mt-3">Labeler</dt>
                  <dd className="font-medium">{drug.labeler || drug.label?.labelerName || drug.manufacturer}</dd>
                </>
              )}

              {/* Product Type (schema field) */}
              {drug.label?.productType && (
                <>
                  <dt className="text-gray-600 mt-3">Product Type</dt>
                  <dd className="font-medium">{drug.label.productType}</dd>
                </>
              )}

              {/* Effective Time (schema field) */}
              {drug.label?.effectiveTime && !isNaN(Date.parse(drug.label.effectiveTime)) && (
                <>
                  <dt className="text-gray-600 mt-3">Effective Time</dt>
                  <dd className="font-medium">{new Date(drug.label.effectiveTime).toLocaleDateString()}</dd>
                </>
              )}

              {/* Therapeutic Class */}
              {drug.therapeuticClass && (
                <>
                  <dt className="text-gray-600 mt-3">Therapeutic Class</dt>
                  <dd className="font-medium">{drug.therapeuticClass}</dd>
                </>
              )}

              {/* Active Ingredient */}
              {drug.activeIngredient && (
                <>
                  <dt className="text-gray-600 mt-3">Active Ingredient</dt>
                  <dd className="font-medium">{drug.activeIngredient}</dd>
                </>
              )}

              {/* Manufacturer/Labeler Name */}
              {drug.manufacturer && (
                <>
                  <dt className="text-gray-600 mt-3">Manufacturer</dt>
                  <dd className="font-medium">{drug.manufacturer}</dd>
                </>
              )}

              {/* DEA Schedule */}
              {drug.dea && (
                <>
                  <dt className="text-gray-600 mt-3">DEA Schedule</dt>
                  <dd className="font-medium">{drug.dea}</dd>
                </>
              )}

              {/* Slug (internal identifier) */}
              <dt className="text-gray-600 mt-3">Slug</dt>
              <dd className="font-medium text-xs text-gray-500">{drug.slug}</dd>
            </dl>

            {relatedDrugs.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3">Related Drugs</h3>
                <div className="space-y-2">
                  {relatedDrugs.map((relatedDrug) => (
                    <Link
                      key={relatedDrug.slug}
                      href={`/drugs/${relatedDrug.slug}`}
                      className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {relatedDrug.drugName}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
    </>
  )
}