/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXUS_ROUTER_URL: process.env.NEXUS_ROUTER_URL || 'http://localhost:6000',
    TWENTY_CRM_URL: process.env.TWENTY_CRM_URL || 'http://localhost:3020',
    WEBSOCKET_URL: process.env.WEBSOCKET_URL || 'ws://localhost:6000/ws',
  },
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXUS_ROUTER_URL || 'http://localhost:6000'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
