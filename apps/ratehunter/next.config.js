/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    QUOTE_ENGINE_URL: process.env.QUOTE_ENGINE_URL || "http://localhost:8001",
    CAMPAIGN_ENGINE_URL: process.env.CAMPAIGN_ENGINE_URL || "http://localhost:8002",
  },
  images: {
    domains: ["localhost"],
  },
};

module.exports = nextConfig;
