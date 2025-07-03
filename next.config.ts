import type { NextConfig } from "next";

if (!process.env.S3_BUCKET_NAME || !process.env.S3_ENDPOINT) {
  throw new Error("S3_BUCKET_NAME and S3_ENDPOINT environment variables are required.");
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: `${process.env.S3_BUCKET_NAME}.${process.env.S3_ENDPOINT}`,
        port: "",
        pathname: "/avatars/**", // Allows any image in the 'avatars' folder
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**", // Allows all paths under localhost for development
      },
      // New: Add your Vercel deployment URL
      {
        protocol: "https",
        hostname: "agent-hunt.vercel.app",
        port: "",
        pathname: "/**", // Allow all paths
      },
      // New: Add your production custom domain
      {
        protocol: "https",
        hostname: "agenthunt.recall.network",
        port: "",
        pathname: "/**", // Allow all paths
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/",
        destination: "/top",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
