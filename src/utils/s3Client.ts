import { S3 } from "@aws-sdk/client-s3";

const s3Client = new S3({
  forcePathStyle: false,
  endpoint: `https://${process.env.S3_ENDPOINT}`,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET!,
  },
});

export { s3Client };
