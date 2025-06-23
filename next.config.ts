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
        pathname: "/avatars/**", // Allows any image in the 'avatars' folder and its subdirectories
      },
    ],
  },
  eslint: {
    // This will prevent ESLint from failing the build.
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
