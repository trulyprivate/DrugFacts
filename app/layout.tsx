import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://drug-info.replit.app'),
  title: {
    default: 'drugfacts.wiki - Comprehensive Drug Information',
    template: '%s | drugfacts.wiki'
  },
  description: 'Access comprehensive FDA-approved drug information, prescribing guidelines, and clinical data. Professional pharmaceutical resource for healthcare providers with patient-friendly explanations.',
  keywords: 'drug information, FDA labels, prescribing information, medication guide, pharmaceutical data, clinical information, drug facts, medical reference',
  authors: [{ name: 'drugfacts.wiki Team', url: 'https://drug-info.replit.app' }],
  creator: 'drugfacts.wiki',
  publisher: 'drugfacts.wiki',
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
  openGraph: {
    title: 'drugfacts.wiki - Comprehensive Drug Information Platform',
    description: 'Access comprehensive FDA-approved drug information, prescribing guidelines, and clinical data. Professional pharmaceutical resource for healthcare providers.',
    type: 'website',
    locale: 'en_US',
    url: 'https://drug-info.replit.app',
    siteName: 'drugfacts.wiki',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'drugfacts.wiki - Drug Information Platform',
    description: 'Access comprehensive FDA-approved drug information and prescribing guidelines.',
  },
  alternates: {
    canonical: 'https://drug-info.replit.app',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main id="main-content" className="flex-1" role="main">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  )
}