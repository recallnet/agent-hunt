import type { NextApiRequest, NextApiResponse } from "next";
import { PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import type { Agent, DuplicateFlag, SpamFlag, Upvote, User } from "@prisma/client";
import prisma from "@utils/db";
import { s3Client } from "@utils/s3Client";
import fs from "fs";
import formidable from "formidable";
import { AgentFields, EnhancedAgent, ErrorResponse } from "@utils/types";

export const config = {
  api: {
    bodyParser: false,
  },
};

// This type represents the raw data structure returned from the Prisma query
type AgentWithRelations = Agent & {
  upvotes: (Upvote & { user: { address: string } })[];
  duplicateFlags: DuplicateFlag[];
  spamFlags: SpamFlag[];
  author: { address: string };
};

/**
 * Transforms a raw agent object from Prisma into the EnhancedAgent structure.
 * It adds the author's address, creates the `upvoters` list, and carries over relations.
 * @param agent - The raw agent data with relations.
 * @returns An EnhancedAgent object.
 */
function transformToEnhancedAgent(agent: AgentWithRelations): EnhancedAgent {
  const { upvotes, author, ...restOfAgent } = agent;
  return {
    ...restOfAgent,
    authorAddress: author.address,
    upvoters: upvotes.map((upvote) => upvote.user.address),
  };
}

// --- Main API Handler ---
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Agent | EnhancedAgent | EnhancedAgent[] | ErrorResponse>
) {
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
 * Handles GET requests.
 * Fetches a single agent or a list of agents with transformed upvoter and author data.
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse<EnhancedAgent | EnhancedAgent[] | ErrorResponse>) {
  const { id, sortBy } = req.query;

  // --- Common Include Clause for Relations (Updated) ---
  const includeClause = {
    upvotes: {
      orderBy: {
        createdAt: "desc" as const, // Most recent upvotes first
      },
      include: {
        user: {
          select: {
            address: true,
          },
        },
      },
    },
    author: {
      select: {
        address: true,
      },
    },
    duplicateFlags: true,
    spamFlags: true,
  };

  // --- Fetch a single agent by ID ---
  if (id && typeof id === "string") {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return res.status(400).json({ error: "Invalid agent ID. ID must be a number." });
    }

    try {
      const agent = await prisma.agent.findUnique({
        where: { id: numericId },
        include: includeClause,
      });

      if (!agent) {
        return res.status(404).json({ error: "Agent not found." });
      }

      // The 'as' cast is safe here because we've updated the includeClause
      const enhancedAgent = transformToEnhancedAgent(agent as AgentWithRelations);
      return res.status(200).json(enhancedAgent);
    } catch (error) {
      console.error(`Failed to fetch agent with id ${id}:`, error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  // --- Fetch a list of agents ---
  let orderByClause;
  switch (sortBy) {
    case "top":
      orderByClause = { upvotes: { _count: "desc" as const } };
      break;
    case "new":
    default:
      orderByClause = { createdAt: "desc" as const };
      break;
  }

  try {
    const agents = await prisma.agent.findMany({
      orderBy: orderByClause,
      include: includeClause,
    });

    const enhancedAgents = agents.map((agent) => transformToEnhancedAgent(agent as AgentWithRelations));
    return res.status(200).json(enhancedAgents);
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
