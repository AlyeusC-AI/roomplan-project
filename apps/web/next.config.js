// eslint-disable-next-line @typescript-eslint/no-require-imports
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false };
    if (isServer) {
      config.plugins = [...config.plugins, new MiniCssExtractPlugin()];
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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nyc3.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname: "fra1.digitaloceanspaces.com",
      },
      {
        protocol: "https",
        hostname: "zmvdimcemmhesgabixlf.supabase.co",
      },
      {
        protocol: "https",
        hostname: "bit.ly",
      },
    ],
    domains: ["zmvdimcemmhesgabixlf.supabase.co", "bit.ly", "ik.imagekit.io","nyc3.digitaloceanspaces.com","fra1.digitaloceanspaces.com"],
  },
};

module.exports = nextConfig;
