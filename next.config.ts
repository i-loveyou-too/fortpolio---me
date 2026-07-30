import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/fortpolio---me",
  assetPrefix: "/fortpolio---me/",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
