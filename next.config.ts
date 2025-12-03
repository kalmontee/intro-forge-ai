import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  target: 'serverless',
  basePath: process.env.PAGES_BASE_PATH,
};

export default nextConfig;
