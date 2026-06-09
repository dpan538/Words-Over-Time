import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "wordsovertime.com" }],
        destination: "https://www.wordsovertime.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
