/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Note: Custom headers don't work with static export, 
  // they need to be configured at the server level (nginx, deploy script)
}

export default nextConfig