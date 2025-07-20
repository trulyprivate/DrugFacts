import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'drugfacts.wiki - Comprehensive Drug Information',
  description: 'Professional drug information resource for healthcare providers',
  keywords: 'drug information, FDA labels, prescribing information, medication guide',
  authors: [{ name: 'drugfacts.wiki' }],
  openGraph: {
    title: 'drugfacts.wiki - Comprehensive Drug Information',
    description: 'Professional drug information resource for healthcare providers',
    type: 'website',
    locale: 'en_US',
    url: 'https://drugfacts.wiki',
    siteName: 'drugfacts.wiki',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  )
}