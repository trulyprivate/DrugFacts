import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getDrugBySlug, getAllDrugs } from '@/lib/drugs'
import DrugHeader from '@/components/drug/DrugHeader'
import CollapsibleSection from '@/components/drug/CollapsibleSection'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

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

  const description = drug.indicationsAndUsage 
    ? drug.indicationsAndUsage.slice(0, 160) + '...'
    : `Professional drug information for ${drug.drugName}`

  return {
    title: `${drug.drugName} (${drug.genericName || 'Drug Information'}) | drugfacts.wiki`,
    description,
    keywords: `${drug.drugName}, ${drug.genericName}, ${drug.therapeuticClass}, drug information, prescribing information`,
    openGraph: {
      title: `${drug.drugName} - Drug Information`,
      description,
      type: 'article',
    },
  }
}

export default async function DrugDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const drug = await getDrugBySlug(slug)
  
  if (!drug) {
    notFound()
  }

  // Get related drugs for sidebar
  const allDrugs = await getAllDrugs()
  const relatedDrugs = allDrugs
    .filter(d => d.slug !== drug.slug && d.therapeuticClass === drug.therapeuticClass)
    .slice(0, 5)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <DrugHeader drug={drug} />
          
          <div className="space-y-6 mt-6">
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

            {drug.indicationsAndUsage && (
              <CollapsibleSection id="indications" title="INDICATIONS AND USAGE" defaultExpanded={true}>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: drug.indicationsAndUsage }} />
              </CollapsibleSection>
            )}

            {drug.dosageAndAdministration && (
              <CollapsibleSection id="dosage" title="DOSAGE AND ADMINISTRATION">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: drug.dosageAndAdministration }} />
              </CollapsibleSection>
            )}

            {drug.contraindications && (
              <CollapsibleSection id="contraindications" title="CONTRAINDICATIONS">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: drug.contraindications }} />
              </CollapsibleSection>
            )}

            {drug.warnings && (
              <CollapsibleSection id="warnings" title="WARNINGS AND PRECAUTIONS">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: drug.warnings }} />
              </CollapsibleSection>
            )}

            {drug.adverseReactions && (
              <CollapsibleSection id="adverse-reactions" title="ADVERSE REACTIONS">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: drug.adverseReactions }} />
              </CollapsibleSection>
            )}

            {drug.drugInteractions && (
              <CollapsibleSection id="drug-interactions" title="DRUG INTERACTIONS">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: drug.drugInteractions }} />
              </CollapsibleSection>
            )}

            {drug.clinicalPharmacology && (
              <CollapsibleSection id="clinical-pharmacology" title="CLINICAL PHARMACOLOGY">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: drug.clinicalPharmacology }} />
              </CollapsibleSection>
            )}

            {drug.clinicalStudies && (
              <CollapsibleSection id="clinical-studies" title="CLINICAL STUDIES">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: drug.clinicalStudies }} />
              </CollapsibleSection>
            )}

            {drug.howSupplied && (
              <CollapsibleSection id="how-supplied" title="HOW SUPPLIED">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: drug.howSupplied }} />
              </CollapsibleSection>
            )}

            {drug.patientCounseling && (
              <CollapsibleSection id="patient-counseling" title="PATIENT COUNSELING INFORMATION">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: drug.patientCounseling }} />
              </CollapsibleSection>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-8">
            <h3 className="font-semibold mb-4">Drug Information</h3>
            <dl className="space-y-3 text-sm">
              {drug.genericName && (
                <>
                  <dt className="text-gray-600">Generic Name</dt>
                  <dd className="font-medium">{drug.genericName}</dd>
                </>
              )}
              {drug.therapeuticClass && (
                <>
                  <dt className="text-gray-600 mt-3">Therapeutic Class</dt>
                  <dd className="font-medium">{drug.therapeuticClass}</dd>
                </>
              )}
              {drug.manufacturer && (
                <>
                  <dt className="text-gray-600 mt-3">Manufacturer</dt>
                  <dd className="font-medium">{drug.manufacturer}</dd>
                </>
              )}
              {drug.dea && (
                <>
                  <dt className="text-gray-600 mt-3">DEA Schedule</dt>
                  <dd className="font-medium">{drug.dea}</dd>
                </>
              )}
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