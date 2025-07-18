import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@utils/db";

// --- Main API Handler ---
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

// --- GET Handler: Fetches the current user's action status (No changes needed) ---
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { id, address } = req.query; // For GET, address comes from query params

  if (!id || typeof id !== "string" || isNaN(parseInt(id))) {
    return res.status(400).json({ error: "A valid agent ID is required." });
  }

  if (!address || typeof address !== "string") {
    return res.status(400).json({ error: "A wallet address is required." });
  }

  const agentId = parseInt(id, 10);

  try {
    const user = await prisma.user.findUnique({ where: { address } });
    if (!user) {
      // If user doesn't exist in our DB, they can't have any actions
      return res.status(200).json({ upvoted: false, duplicateFlagged: false, spamFlagged: false });
    }

    // Check for each action using your specific models
    const upvoted = await prisma.upvote.findUnique({
      where: { userId_agentId: { userId: user.id, agentId } },
    });
    const duplicateFlagged = await prisma.duplicateFlag.findUnique({
      where: { userId_agentId: { userId: user.id, agentId } },
    });
    const spamFlagged = await prisma.spamFlag.findUnique({
      where: { userId_agentId: { userId: user.id, agentId } },
    });

    return res.status(200).json({
      upvoted: !!upvoted,
      duplicateFlagged: !!duplicateFlagged,
      spamFlagged: !!spamFlagged,
    });
  } catch (error) {
    console.error(`Failed to fetch user actions for agent ${id}:`, error);
    return res.status(500).json({ error: "Internal server error." });
  }
}

// --- POST Handler: Performs or removes an action ---
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; // Agent ID
  const { action, address, reason } = req.body; // `reason` can be the reason text or the duplicate URL

  if (!id || typeof id !== "string" || isNaN(parseInt(id))) {
    return res.status(400).json({ error: "Invalid agent ID." });
  }

  if (!address || typeof address !== "string") {
    return res.status(401).json({ error: "Wallet address is required." });
  }

  if (!["upvote", "duplicate", "spam"].includes(action)) {
    return res.status(400).json({ error: "Invalid action." });
  }

  const agentId = parseInt(id, 10);

  try {
    // Find or create the user based on their wallet address
    const user = await prisma.user.upsert({
      where: { address },
      update: {},
      create: { address },
    });

    // Handle each action directly to ensure type safety
    switch (action) {
      case "upvote": {
        const where = { userId_agentId: { userId: user.id, agentId } };
        const existing = await prisma.upvote.findUnique({ where });

        if (existing) {
          await prisma.upvote.delete({ where });
          return res.status(200).json({ message: "Upvote removed." });
        } else {
          // The `reason` is now required for upvoting
          if (!reason) {
            return res.status(400).json({ error: "A reason is required to upvote." });
          }
          const newAction = await prisma.upvote.create({
            data: { userId: user.id, agentId, reason },
          });
          return res.status(201).json(newAction);
        }
      }
      case "duplicate": {
        const where = { userId_agentId: { userId: user.id, agentId } };
        const existing = await prisma.duplicateFlag.findUnique({ where });

        if (existing) {
          await prisma.duplicateFlag.delete({ where });
          return res.status(200).json({ message: "Duplicate flag removed." });
        } else {
          // The `duplicateAgentUrl` is required when creating a new flag
          if (!reason) {
            return res.status(400).json({ error: "Duplicate agent URL is required." });
          }
          const newAction = await prisma.duplicateFlag.create({
            data: { userId: user.id, agentId, duplicateAgentUrl: reason },
          });
          return res.status(201).json(newAction);
        }
      }
      case "spam": {
        const where = { userId_agentId: { userId: user.id, agentId } };
        const existing = await prisma.spamFlag.findUnique({ where });

        if (existing) {
          await prisma.spamFlag.delete({ where });
          return res.status(200).json({ message: "Spam flag removed." });
        } else {
          const newAction = await prisma.spamFlag.create({
            data: { userId: user.id, agentId, reason },
          });
          return res.status(201).json(newAction);
        }
      }
      default:
        // This case is redundant due to the check above but good for safety
        return res.status(400).json({ error: "Invalid action." });
    }
  } catch (error) {
    console.error(`Failed to process ${action} for agent ${id}:`, error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
