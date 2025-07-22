import { Metadata } from 'next'
import { staticPageDescriptions } from '@/lib/seo-utils'

export const metadata: Metadata = {
  title: 'Search Drugs - drugfacts.wiki',
  description: staticPageDescriptions.search,
  keywords: 'drug search, medication lookup, pharmaceutical database, prescription drugs, FDA approved medications',
  openGraph: {
    title: 'Search Drugs - drugfacts.wiki',
    description: 'Search our comprehensive database of FDA-approved medications. Find detailed drug information, prescribing guidelines, side effects, and drug interactions.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search Drugs - drugfacts.wiki',
    description: 'Search our comprehensive database of FDA-approved medications.',
  },
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}