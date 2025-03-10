/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false };
    if (isServer) {
      config.plugins = [...config.plugins];
    }
    return config;
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: true,
  images: {
    domains: ["zmvdimcemmhesgabixlf.supabase.co", "bit.ly"],
  },
};

module.exports = nextConfig;
