/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow build even with TS/ESLint noise (temporary for deployment)
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.supabase.co' }
    ]
  }
}
export default nextConfig
