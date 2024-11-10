const intercept = require('intercept-stdout')
const { PrismaPlugin } = require('experimental-prisma-webpack-plugin')

function interceptStdout(text) {
  if (text.includes('Duplicate atom key')) {
    return ''
  }
  return text
}
// Intercept in dev and prod
intercept(interceptStdout)

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false }
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()]
    }
    return config
  },
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  productionBrowserSourceMaps: true,
  images: {
    domains: [
      'zmvdimcemmhesgabixlf.supabase.co',
      'assryutwyfriduafbeyu.supabase.co',
      'bit.ly',
    ],
  },
  transpilePackages: [
    '@servicegeek/api',
    '@servicegeek/db',
    '@servicegeek/utils',
    '@fullcalendar/core',
    '@fullcalendar/common',
    '@fullcalendar/react',
    '@fullcalendar/daygrid',
    '@fullcalendar/timegrid',
    '@fullcalendar/interaction',
  ],
}

module.exports = nextConfig
