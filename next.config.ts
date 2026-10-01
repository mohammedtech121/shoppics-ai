import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* The app is fully client-side; no remote patterns needed (plain <img> tags,
     not next/image). Vercel runs `next build` — type errors fail the build. */
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
};

export default nextConfig;
