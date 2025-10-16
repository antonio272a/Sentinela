/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // desliga ESLint no build
  },
  typescript: {
    ignoreBuildErrors: true, // desliga TypeScript type-check no build
  },
};

module.exports = nextConfig;
