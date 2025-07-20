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

export async function generateStaticParams() {
  const drugs = await getAllDrugs()
  return drugs.map((drug) => ({
    slug: drug.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const drug = await getDrugBySlug(slug)
  if (!drug) return {}

  // Generate enhanced SEO content
  const seoContent = generateSEOContent(drug)

  return {
    title: seoContent.title,
    description: seoContent.metaDescription,
    keywords: seoContent.keywords.join(', '),
    authors: [{ name: 'drugfacts.wiki' }],
    openGraph: {
      title: seoContent.openGraphTitle,
      description: seoContent.openGraphDescription,
      type: 'article',
      siteName: 'drugfacts.wiki',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoContent.openGraphTitle,
      description: seoContent.openGraphDescription,
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
  }
}

export default async function DrugDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const drug = await getDrugBySlug(slug)
  
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <DrugHeader drug={drug} />
          
          <Tabs defaultValue="professional" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="professional">Professional Info</TabsTrigger>
              <TabsTrigger value="patient">Patient-Friendly</TabsTrigger>
              <TabsTrigger value="faq">FAQ & Related</TabsTrigger>
            </TabsList>

            <TabsContent value="professional" className="space-y-6 mt-6">
            {/* Highlights section from schema */}
            {(drug.label?.highlights?.dosageAndAdministration || drug.dosageAndAdministration) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-1">
                <CollapsibleSection 
                  id="highlights"
                  title="HIGHLIGHTS" 
                  defaultExpanded={true}
                >
                  <div className="prose max-w-none">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Dosage and Administration Highlights</h4>
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

            {/* Indications and Usage */}
            {(drug.label?.indicationsAndUsage || drug.indicationsAndUsage) && (
              <CollapsibleSection id="indications" title="INDICATIONS AND USAGE" defaultExpanded={true}>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                  __html: drug.label?.indicationsAndUsage || drug.indicationsAndUsage || '' 
                }} />
              </CollapsibleSection>
            )}

            {/* Dosage and Administration */}
            {(drug.label?.dosageAndAdministration || drug.dosageAndAdministration) && (
              <CollapsibleSection id="dosage" title="DOSAGE AND ADMINISTRATION">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                  __html: drug.label?.dosageAndAdministration || drug.dosageAndAdministration || '' 
                }} />
              </CollapsibleSection>
            )}

            {/* Dosage Forms and Strengths (from schema) */}
            {(drug.label?.dosageFormsAndStrengths || drug.dosageFormsAndStrengths) && (
              <CollapsibleSection id="dosage-forms" title="DOSAGE FORMS AND STRENGTHS">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                  __html: drug.label?.dosageFormsAndStrengths || drug.dosageFormsAndStrengths || '' 
                }} />
              </CollapsibleSection>
            )}

            {/* Contraindications */}
            {(drug.label?.contraindications || drug.contraindications) && (
              <CollapsibleSection id="contraindications" title="CONTRAINDICATIONS">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                  __html: drug.label?.contraindications || drug.contraindications || '' 
                }} />
              </CollapsibleSection>
            )}

            {/* Warnings and Precautions */}
            {(drug.label?.warningsAndPrecautions || drug.warnings || drug.warningsAndPrecautions) && (
              <CollapsibleSection id="warnings" title="WARNINGS AND PRECAUTIONS">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                  __html: drug.label?.warningsAndPrecautions || drug.warnings || drug.warningsAndPrecautions || '' 
                }} />
              </CollapsibleSection>
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
            {(drug.label?.nonclinicalToxicology || drug.nonClinicalToxicology || drug.nonclinicalToxicology) && (
              <CollapsibleSection id="nonclinical-toxicology" title="NONCLINICAL TOXICOLOGY">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ 
                  __html: drug.label?.nonclinicalToxicology || drug.nonClinicalToxicology || drug.nonclinicalToxicology || '' 
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

            <TabsContent value="patient" className="space-y-6 mt-6">
              <ProviderFriendlySection content={providerFriendlyContent} />
            </TabsContent>

            <TabsContent value="faq" className="space-y-6 mt-6">
              <FAQSection faqs={faqSections} drugName={drug.drugName} />
              <RelatedContentSection content={relatedContent} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-8">
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
              {drug.label?.effectiveTime && (
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
  )
}