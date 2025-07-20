import { MetadataRoute } from 'next'
import { getAllDrugs } from '@/lib/drugs'

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://drugfacts.wiki'
  
  try {
    const drugs = await getAllDrugs()
    
    const drugUrls = drugs.map((drug) => ({
      url: `${baseUrl}/drugs/${drug.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
    
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      ...drugUrls,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return basic sitemap if drug fetching fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/search`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
    ]
  }
}