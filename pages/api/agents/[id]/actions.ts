import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../utils/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // Agent ID
  const { action, address } = req.body; // Action: "upvote", "duplicate", or "spam"; address from wallet

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid agent ID." });
  }

  if (!address || typeof address !== "string") {
    return res.status(401).json({ error: "Wallet address is required." });
  }

  if (!["upvote", "duplicate", "spam"].includes(action)) {
    return res.status(400).json({ error: "Invalid action." });
  }

  try {
    // Upsert user based on wallet address
    const user = await prisma.user.upsert({
      where: { address },
      update: {},
      create: { address },
    });

    const agentId = parseInt(id, 10);
    if (isNaN(agentId)) {
      return res.status(400).json({ error: "Invalid agent ID." });
    }

    switch (action) {
      case "upvote":
        return await handleToggleAction(req, res, prisma.upvote, { userId: user.id, agentId }, "Upvote");
      case "duplicate":
        return await handleToggleAction(req, res, prisma.duplicateFlag, { userId: user.id, agentId }, "Duplicate flag");
      case "spam":
        return await handleToggleAction(req, res, prisma.spamFlag, { userId: user.id, agentId }, "Spam flag");
      default:
        return res.status(400).json({ error: "Invalid action." });
    }
  } catch (error) {
    console.error(`Failed to process ${action}:`, error);
    return res.status(500).json({ error: "Internal server error." });
  }
}

async function handleToggleAction(
  req: NextApiRequest,
  res: NextApiResponse,
  model: any, // Prisma model (Upvote, DuplicateFlag, SpamFlag)
  where: { userId: number; agentId: number },
  actionName: string
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Check if action exists using the composite unique key
  const existingAction = await model.findUnique({
    where: {
      userId_agentId: {
        userId: where.userId,
        agentId: where.agentId,
      },
    },
  });

  if (existingAction) {
    // Undo action: delete it
    await model.delete({
      where: {
        userId_agentId: {
          userId: where.userId,
          agentId: where.agentId,
        },
      },
    });
    return res.status(200).json({ message: `${actionName} removed.` });
  } else {
    // Create action with timestamp
    const newAction = await model.create({
      data: {
        userId: where.userId,
        agentId: where.agentId,
        createdAt: new Date(),
      },
    });
    return res.status(201).json(newAction);
  }
}
