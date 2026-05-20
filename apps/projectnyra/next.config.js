const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["localhost"],
  },
};

module.exports = nextConfig;
