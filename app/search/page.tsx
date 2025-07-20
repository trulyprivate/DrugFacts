'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import SearchBar from '@/components/drug/SearchBar'
import { searchDrugsClient } from '@/lib/drugs-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { DrugLabel } from '@/types/drug'
import { generateProviderFriendlyContent } from '@/lib/content-generation'

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<DrugLabel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    const searchDrugs = async () => {
      if (query) {
        setIsLoading(true)
        try {
          const drugs = await searchDrugsClient(query)
          setResults(drugs)
        } catch (error) {
          console.error('Search error:', error)
          setResults([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setResults([])
      }
    }
    
    searchDrugs()
  }, [query])
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Search Drugs</h1>
        <div className="mb-8">
          <SearchBar defaultValue={query} />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : query ? (
          <>
            <p className="text-gray-600 mb-6">
              Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
            </p>
            
            <div className="space-y-4">
              {results.map((drug) => (
                <Link
                  key={drug.slug}
                  href={`/drugs/${drug.slug}`}
                  className="block group"
                >
                  <Card className="transition-shadow hover:shadow-lg">
                    <CardHeader>
                      <CardTitle className="group-hover:text-gray-700 transition-colors">
                        {drug.drugName}
                      </CardTitle>
                      {drug.genericName && (
                        <CardDescription>{drug.genericName}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {drug.therapeuticClass && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {drug.therapeuticClass}
                          </span>
                        )}
                        {drug.manufacturer && (
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                            {drug.manufacturer}
                          </span>
                        )}
                        {drug.activeIngredient && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            {drug.activeIngredient}
                          </span>
                        )}
                      </div>
                      {drug.indicationsAndUsage && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {drug.indicationsAndUsage.replace(/<[^>]*>/g, '').slice(0, 200)}...
                          </p>
                          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            Patient-friendly: {generateProviderFriendlyContent(drug).whatItTreats.slice(0, 120)}...
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
              
              {results.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-600">No drugs found matching your search.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Try searching by drug name, generic name, or therapeutic class.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">Enter a search term to find drugs.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
      <SearchContent />
    </Suspense>
  )
}