/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    forceNodeRuntime: true, // evita builds Edge
  },
};

module.exports = nextConfig;
