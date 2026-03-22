import type { NextConfig } from "next";

// GitHub Pages requer static export + basePath.
// No Vercel essas opções são removidas para habilitar SSR e otimizações nativas.
const isGithubPages = !!process.env.NEXT_PUBLIC_BASE_PATH;

const nextConfig: NextConfig = {
  ...(isGithubPages && {
    output: "export",
    trailingSlash: true,
  }),
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: {
    unoptimized: isGithubPages,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "prod.spline.design" },
      { protocol: "https", hostname: "ddragon.leagueoflegends.com" },
    ],
  },
};

export default nextConfig;
