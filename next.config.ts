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

  async redirects() {
    return [
      {
        source: "/",
        destination: "/top",
        permanent: false, // Use `true` (308 redirect) for permanent moves, good for SEO
      },
    ];
  },
};

export default nextConfig;
