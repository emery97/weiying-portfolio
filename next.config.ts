import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["www.notion.so", "s3.us-west-2.amazonaws.com"],
  },
  devIndicators: false
};

export default nextConfig;
