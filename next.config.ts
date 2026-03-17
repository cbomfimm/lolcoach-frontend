import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: {
    unoptimized: true,
    domains: ["images.unsplash.com", "prod.spline.design", "ddragon.leagueoflegends.com"],
  },
};

export default nextConfig;
