import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
    domains: ["images.unsplash.com", "prod.spline.design", "ddragon.leagueoflegends.com"],
  },
};

export default nextConfig;
