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
    domains: ["zmvdimcemmhesgabixlf.supabase.co", "bit.ly", "ik.imagekit.io"],
  },
};

module.exports = nextConfig;
