import type { NextApiRequest, NextApiResponse } from "next";
import { PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import type { Agent, DuplicateFlag, SpamFlag, Upvote } from "@prisma/client";
import prisma from "@utils/db";
import { s3Client } from "@utils/s3Client";
import fs from "fs";
import formidable from "formidable";
import { AgentFields, EnhancedAgent, ErrorResponse, PaginatedAgentsResponse } from "@utils/types";

export const config = {
  api: {
    bodyParser: false,
  },
};

// This represents the raw data structure from Prisma including all relations.
type AgentWithRelations = Agent & {
  upvotes: (Upvote & { user: { address: string } })[];
  duplicateFlags: DuplicateFlag[];
  spamFlags: SpamFlag[];
  author: { address: string };
};

const AGENTS_PER_PAGE = 50;

/**
 * Transforms a raw agent object from Prisma into the EnhancedAgent structure.
 * It flattens the author's address and creates a simple `upvoters` list of addresses.
 * @param agent The raw agent data with relations.
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
  res: NextApiResponse<Agent | EnhancedAgent | PaginatedAgentsResponse | ErrorResponse>
) {
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
 * Fetches a single agent by ID or a paginated list of agents.
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<EnhancedAgent | PaginatedAgentsResponse | ErrorResponse>
) {
  const { id, sortBy, page = "1" } = req.query;

  // This clause defines the related data we want to fetch with every agent.
  const includeClause = {
    upvotes: {
      orderBy: { createdAt: "desc" as const },
      include: { user: { select: { address: true } } },
    },
    author: {
      select: { address: true },
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

      const enhancedAgent = transformToEnhancedAgent(agent as AgentWithRelations);
      return res.status(200).json(enhancedAgent);
    } catch (error) {
      console.error(`Failed to fetch agent with id ${id}:`, error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  // --- Fetch a paginated list of agents ---
  const currentPage = parseInt(page as string, 10);
  if (isNaN(currentPage) || currentPage < 1) {
    return res.status(400).json({ error: "Invalid page number." });
  }

  const skip = (currentPage - 1) * AGENTS_PER_PAGE;

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
      take: AGENTS_PER_PAGE + 1, // Fetch one extra to check if there are more pages
      skip: skip,
    });

    const hasMore = agents.length > AGENTS_PER_PAGE;
    const agentsForPage = agents.slice(0, AGENTS_PER_PAGE);

    const enhancedAgents = agentsForPage.map((agent) => transformToEnhancedAgent(agent as AgentWithRelations));

    return res.status(200).json({ agents: enhancedAgents, hasMore });
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}

/**
 * Handles POST requests to create a new agent.
 * Parses form data, uploads an avatar to S3, and creates an agent record.
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
        skill: agentData.skill as Agent["skill"],
        authorId: user.id,
      },
    });

    return res.status(201).json(newAgent);
  } catch (error) {
    console.error("Failed to create agent:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
