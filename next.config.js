/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  // Ensure CSS processing is properly configured
  webpack: (config) => {
    return config;
  },
}

module.exports = nextConfig
