import Link from 'next/link'
import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SearchBar from '@/components/drug/SearchBar'
import { getAllDrugs } from '@/lib/drugs'
import { Pill, FileText, Search, Shield, Users, BookOpen, HelpCircle } from 'lucide-react'
import { generateHomepageDescription } from '@/lib/seo-utils'

export const metadata: Metadata = {
  title: 'drugfacts.wiki - Professional Drug Information Platform',
  description: generateHomepageDescription(),
  keywords: 'drug information, FDA labels, prescribing information, medication guide, drug interactions, side effects, dosage guidelines, medical professionals',
  alternates: {
    canonical: 'https://drugfacts.wiki',
  },
  openGraph: {
    title: 'drugfacts.wiki - Professional Drug Information Platform',
    description: 'Access comprehensive drug information, FDA labels, prescribing guidelines, and side effects for healthcare professionals.',
    type: 'website',
    url: 'https://drugfacts.wiki',
    siteName: 'drugfacts.wiki',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 512,
        height: 512,
        alt: 'drugfacts.wiki - Professional Drug Information',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'drugfacts.wiki - Professional Drug Information Platform',
    description: 'Access comprehensive drug information, FDA labels, prescribing guidelines, and side effects.',
    site: '@drugfactswiki',
    creator: '@drugfactswiki',
    images: ['/og-image.png'],
  },
  verification: {
    google: '',
    yandex: '',
    yahoo: '',
  },
}

export default async function HomePage() {
  const drugs = await getAllDrugs()
  
  // Generate structured data for the homepage
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "drugfacts.wiki",
    url: "https://drugfacts.wiki",
    logo: "https://drugfacts.wiki/og-image.png",
    description: "Professional drug information platform providing comprehensive FDA-approved prescribing information",
    sameAs: [
      "https://twitter.com/drugfactswiki"
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "",
      contactType: "customer service",
      availableLanguage: "English"
    }
  }

  const webSiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "drugfacts.wiki",
    url: "https://drugfacts.wiki",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://drugfacts.wiki/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  const medicalWebPageData = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: "drugfacts.wiki - Professional Drug Information Platform",
    description: "Access comprehensive drug information, FDA labels, prescribing guidelines, and side effects",
    url: "https://drugfacts.wiki",
    medicalAudience: {
      "@type": "MedicalAudience",
      audienceType: "Healthcare professionals"
    },
    about: {
      "@type": "MedicalEntity",
      name: "Pharmaceutical drugs"
    },
    publisher: {
      "@type": "Organization",
      name: "drugfacts.wiki"
    }
  }
  
  return (
    <>
      {/* Structured Data Scripts - Using inline script tags for better SSR */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webSiteData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(medicalWebPageData)
        }}
      />
      
      <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section - Optimized for LCP */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          {/* LCP Element - Prioritized rendering */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 md:mb-12" style={{ contain: 'layout style paint' }}>
            Professional Drug Information Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Complete prescribing information with patient-friendly explanations, FAQs, and related content suggestions
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Features Section - Optimized for Performance */}
      <section className="py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Enhanced Content Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12" style={{ gap: '1.5rem' }}>
            <Card>
              <CardHeader>
                <Pill className="h-8 w-8 text-blue-600 mb-2" aria-hidden="true" />
                <CardTitle>Drug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Complete prescribing information, dosing guidelines, and clinical data
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <FileText className="h-8 w-8 text-blue-600 mb-2" aria-hidden="true" />
                <CardTitle>FDA Labels</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Official FDA-approved drug labeling and package inserts
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Search className="h-8 w-8 text-blue-600 mb-2" aria-hidden="true" />
                <CardTitle>Easy Search</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Search by drug name, generic name, or therapeutic class
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-blue-600 mb-2" aria-hidden="true" />
                <CardTitle>Safety Info</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Warnings, contraindications, and drug interaction information
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* New Content Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12" style={{ gap: '1.5rem' }}>
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <Users className="h-8 w-8 text-green-600 mb-2" aria-hidden="true" />
                <CardTitle className="text-green-800">Patient-Friendly Explanations</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-green-700">
                  Medical information translated into easy-to-understand language for patients and caregivers
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <HelpCircle className="h-8 w-8 text-orange-600 mb-2" aria-hidden="true" />
                <CardTitle className="text-orange-800">FAQ Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-orange-700">
                  Automatically generated frequently asked questions from drug labeling information
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-purple-600 mb-2" aria-hidden="true" />
                <CardTitle className="text-purple-800">Related Content</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-purple-700">
                  Discover similar medications, related conditions, and alternative treatment options
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Drug List - Only show first 6 drugs initially */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Available Drugs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drugs.slice(0, 6).map((drug) => (
                <Link
                  key={drug.slug}
                  href={`/drugs/${drug.slug}`}
                  className="block group h-full"
                  aria-label={`View information for ${drug.drugName}${drug.genericName ? ` (${drug.genericName})` : ''}`}
                >
                  <Card className="h-full transition-all duration-200 hover:shadow-lg hover:shadow-blue-100 hover:border-blue-200 cursor-pointer transform hover:-translate-y-1">
                    <CardHeader className="pb-3">
                      <CardTitle className="group-hover:text-blue-600 transition-colors text-lg font-semibold">
                        {drug.drugName}
                      </CardTitle>
                      {drug.genericName && (
                        <CardDescription className="text-gray-600">{drug.genericName}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-2">
                        {drug.therapeuticClass && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                            {drug.therapeuticClass}
                          </span>
                        )}
                        {drug.manufacturer && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {drug.manufacturer}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            {drugs.length > 6 && (
              <div className="mt-8 text-center">
                <Link href="/drugs" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  View All {drugs.length} Drugs
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
    </>
  )
}