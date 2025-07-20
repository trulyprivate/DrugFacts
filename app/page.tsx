import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SearchBar from '@/components/drug/SearchBar'
import { getAllDrugs } from '@/lib/drugs'
import { Pill, FileText, Search, Shield, Users, BookOpen, Stethoscope, HelpCircle } from 'lucide-react'

export default async function HomePage() {
  const drugs = await getAllDrugs()
  
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
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

      {/* Features Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Enhanced Content Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardHeader>
                <Pill className="h-8 w-8 text-blue-600 mb-2" />
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
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
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
                <Search className="h-8 w-8 text-blue-600 mb-2" />
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
                <Shield className="h-8 w-8 text-blue-600 mb-2" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <Users className="h-8 w-8 text-green-600 mb-2" />
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
                <HelpCircle className="h-8 w-8 text-orange-600 mb-2" />
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
                <BookOpen className="h-8 w-8 text-purple-600 mb-2" />
                <CardTitle className="text-purple-800">Related Content</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-purple-700">
                  Discover similar medications, related conditions, and alternative treatment options
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Drug List */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Available Drugs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drugs.map((drug) => (
                <Link
                  key={drug.slug}
                  href={`/drugs/${drug.slug}`}
                  className="block group"
                >
                  <Card className="h-full transition-shadow hover:shadow-lg">
                    <CardHeader>
                      <CardTitle className="group-hover:text-blue-600 transition-colors">
                        {drug.drugName}
                      </CardTitle>
                      {drug.genericName && (
                        <CardDescription>{drug.genericName}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {drug.therapeuticClass && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {drug.therapeuticClass}
                          </span>
                        )}
                        {drug.manufacturer && (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {drug.manufacturer}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}