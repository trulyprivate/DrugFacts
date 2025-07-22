import { Metadata } from 'next'
import { staticPageDescriptions } from '@/lib/seo-utils'

export const metadata: Metadata = {
  title: 'Drug Manufacturers - drugfacts.wiki',
  description: staticPageDescriptions.manufacturers,
  keywords: 'pharmaceutical manufacturers, drug companies, medication brands, pharmaceutical industry, FDA approved manufacturers',
  openGraph: {
    title: 'Drug Manufacturers - drugfacts.wiki',
    description: 'Browse medications by pharmaceutical manufacturer. Find drugs from major companies and FDA-approved manufacturers.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Drug Manufacturers - drugfacts.wiki',
    description: 'Browse medications by pharmaceutical manufacturer.',
  },
}

export default function ManufacturersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}