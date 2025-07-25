import { Metadata } from 'next'
import { staticPageDescriptions } from '@/lib/seo-utils'

export const metadata: Metadata = {
  title: 'Therapeutic Classes - drugfacts.wiki',
  description: staticPageDescriptions.therapeuticClasses,
  keywords: 'therapeutic classes, drug categories, medication classification, pharmacological groups, medical categories',
  openGraph: {
    title: 'Therapeutic Classes - drugfacts.wiki',
    description: 'Browse medications by therapeutic class including cardiovascular, respiratory, endocrine, and neurological drugs.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Therapeutic Classes - drugfacts.wiki',
    description: 'Browse medications by therapeutic class including cardiovascular, respiratory, endocrine, and neurological drugs.',
  },
}

export default function TherapeuticClassesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}