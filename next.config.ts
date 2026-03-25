import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // এটি বিল্ড করার সময় লিন্ট চেক করা বন্ধ করবে
    ignoreDuringBuilds: true,
  },
  typescript: {
    // টাইপস্ক্রিপ্ট এরর থাকলেও বিল্ড হতে দেবে
    ignoreBuildErrors: true,
  },
};

export default nextConfig;