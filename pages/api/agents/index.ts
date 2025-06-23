import type { NextApiRequest, NextApiResponse } from "next";
import { PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import type { Agent } from "@prisma/client";
import prisma from "../../../utils/db";
import { s3Client } from "../../../utils/s3Client";
import fs from "fs";
import formidable from "formidable";
import { AgentFields, ErrorResponse } from "../../../utils/types";

export const config = {
  api: {
    bodyParser: false,
  },
};

// --- Main API Handler ---
export default async function handler(req: NextApiRequest, res: NextApiResponse<Agent | Agent[] | ErrorResponse>) {
  // Route based on HTTP method
  switch (req.method) {
    case "GET":
      return await handleGet(req, res);
    case "POST":
      return await handlePost(req, res);
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

/**
 * Handles GET requests to fetch all agents.
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse<Agent[] | ErrorResponse>) {
  try {
    const agents = await prisma.agent.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            address: true,
          },
        },
      },
    });
    return res.status(200).json(agents);
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * Handles POST requests to create a new agent.
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse<Agent | ErrorResponse>) {
  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);

    const agentData: AgentFields = {
      name: fields.name?.[0] || "",
      xAccount: fields.xAccount?.[0] || "",
      description: fields.description?.[0] || "",
      whyHunt: fields.whyHunt?.[0] || "",
      skill: (fields.skill?.[0] || "") as AgentFields["skill"],
      authorAddress: fields.authorAddress?.[0] || "",
    };

    const avatarFile = files.avatar?.[0];

    if (!avatarFile || !agentData.authorAddress) {
      return res.status(400).json({ error: "Missing required fields or avatar." });
    }

    const user = await prisma.user.upsert({
      where: { address: agentData.authorAddress },
      update: {},
      create: { address: agentData.authorAddress },
    });

    const fileContent = fs.readFileSync(avatarFile.filepath);
    const key = `avatars/agent-${Date.now()}-${avatarFile.originalFilename}`;
    const s3Bucket = process.env.S3_BUCKET_NAME!;
    const putObjectParams: PutObjectCommandInput = {
      Bucket: s3Bucket,
      Key: key,
      Body: fileContent,
      ContentType: avatarFile.mimetype || "image/jpeg",
      ACL: "public-read",
    };
    await s3Client.send(new PutObjectCommand(putObjectParams));
    const avatarUrl = `https://${s3Bucket}.${process.env.S3_ENDPOINT}/${key}`;

    const newAgent = await prisma.agent.create({
      data: {
        name: agentData.name,
        avatarUrl: avatarUrl,
        xAccount: agentData.xAccount,
        description: agentData.description,
        whyHunt: agentData.whyHunt,
        skill: agentData.skill,
        authorId: user.id,
      },
    });

    return res.status(201).json(newAgent);
  } catch (error) {
    console.error("Failed to create agent:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
