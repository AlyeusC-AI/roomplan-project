/* eslint-disable @typescript-eslint/no-require-imports */
const intercept = require("intercept-stdout");
const { PrismaPlugin } = require("@prisma/nextjs-monorepo-workaround-plugin");

function interceptStdout(text) {
  if (text.includes("Duplicate atom key")) {
    return "";
  }
  return text;
}
// Intercept in dev and prod
intercept(interceptStdout);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false };
    if (isServer) {
      config.plugins = [...config.plugins];
    }
    return config;
  },
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  productionBrowserSourceMaps: true,
  images: {
    domains: ["zmvdimcemmhesgabixlf.supabase.co", "bit.ly"],
  },
  transpilePackages: [
    "@servicegeek/api",
    "@servicegeek/db",
    "@fullcalendar/core",
    "@fullcalendar/common",
    "@fullcalendar/react",
    "@fullcalendar/daygrid",
    "@fullcalendar/timegrid",
    "@fullcalendar/interaction",
  ],
};

module.exports = nextConfig;
