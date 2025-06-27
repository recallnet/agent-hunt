import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@utils/db";

interface ActionDelegate {
  findUnique(args: { where: { userId_agentId: { userId: number; agentId: number } } }): Promise<object | null>;

  delete(args: { where: { userId_agentId: { userId: number; agentId: number } } }): Promise<object>;

  create(args: { data: { userId: number; agentId: number; createdAt: Date } }): Promise<object>;
}

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

// --- GET Handler: Fetches the current user's action status ---
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
  const { action, address } = req.body; // For POST, action/address are in the body

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

    switch (action) {
      case "upvote":
        return await handleToggleAction(res, prisma.upvote, { userId: user.id, agentId }, "Upvote");
      case "duplicate":
        return await handleToggleAction(res, prisma.duplicateFlag, { userId: user.id, agentId }, "Duplicate flag");
      case "spam":
        return await handleToggleAction(res, prisma.spamFlag, { userId: user.id, agentId }, "Spam flag");
      default:
        // This case is redundant due to the check above but good for safety
        return res.status(400).json({ error: "Invalid action." });
    }
  } catch (error) {
    console.error(`Failed to process ${action} for agent ${id}:`, error);
    return res.status(500).json({ error: "Internal server error." });
  }
}

async function handleToggleAction(
  res: NextApiResponse,
  model: ActionDelegate, // Use the specific interface instead of 'any'
  where: { userId: number; agentId: number },
  actionName: string
) {
  const existingAction = await model.findUnique({
    where: { userId_agentId: where },
  });

  if (existingAction) {
    // If the action exists, remove it
    await model.delete({ where: { userId_agentId: where } });
    return res.status(200).json({ message: `${actionName} removed.` });
  } else {
    // If the action does not exist, create it
    const newAction = await model.create({
      data: { ...where, createdAt: new Date() },
    });
    return res.status(201).json(newAction);
  }
}
