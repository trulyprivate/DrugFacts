import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://drugfacts.wiki'),
  title: 'drugfacts.wiki - Comprehensive Drug Information',
  description: 'Quickly search for drug information, interactions, and side effects. Your reliable source for FDA-approved medical data and prescribing information.',
  keywords: 'drug information, FDA labels, prescribing information, medication guide, drug interactions, side effects, dosage',
  authors: [{ name: 'drugfacts.wiki' }],
  robots: 'index, follow',
  openGraph: {
    title: 'drugfacts.wiki - Comprehensive Drug Information',
    description: 'Quickly search for drug information, interactions, and side effects. Your reliable source for FDA-approved medical data.',
    type: 'website',
    locale: 'en_US',
    url: 'https://drugfacts.wiki',
    siteName: 'drugfacts.wiki',
    images: [
      {
        url: '/og-image.png',
        width: 512,
        height: 512,
        alt: 'drugfacts.wiki - Comprehensive Drug Information with Medical Pills Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'drugfacts.wiki - Comprehensive Drug Information',
    description: 'Quickly search for drug information, interactions, and side effects.',
    images: ['/og-image.png'],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preload" href="/og-image.png" as="image" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/og-image.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/og-image.png" />
        <link rel="apple-touch-icon" href="/og-image.png" />
        <meta name="theme-color" content="#3B82F6" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1" role="main">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  )
}