import Head from 'next/head'

export default function CriticalResourceHints() {
  return (
    <Head>
      {/* DNS Prefetching */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      
      {/* Preconnect to critical domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Preload critical assets */}
      <link rel="preload" href="/og-image.png" as="image" type="image/png" />
      <link rel="preload" href="/favicon.ico" as="image" type="image/x-icon" />
      
      {/* Resource hints for better performance */}
      <meta httpEquiv="X-DNS-Prefetch-Control" content="on" />
    </Head>
  )
}