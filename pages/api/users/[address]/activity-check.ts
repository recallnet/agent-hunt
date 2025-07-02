import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@utils/db";

type ActivityResponse = {
  agentCount: number;
  totalActionCount: number;
};

type ErrorResponse = {
  error: string;
};

/**
 * Handles GET requests to check a user's activity within the last 24 hours.
 * This is used to enforce rate limits for creating agents and performing actions.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<ActivityResponse | ErrorResponse>) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { address } = req.query;

  if (!address || typeof address !== "string") {
    return res.status(400).json({ error: "A valid wallet address is required." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { address },
    });

    // If the user does not exist in the database, they have no activity.
    if (!user) {
      return res.status(200).json({ agentCount: 0, totalActionCount: 0 });
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Concurrently count all relevant activities for the user in the last 24 hours.
    const [agentCount, upvoteCount, duplicateFlagCount, spamFlagCount] = await Promise.all([
      prisma.agent.count({
        where: { authorId: user.id, createdAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.upvote.count({
        where: { userId: user.id, createdAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.duplicateFlag.count({
        where: { userId: user.id, createdAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.spamFlag.count({
        where: { userId: user.id, createdAt: { gte: twentyFourHoursAgo } },
      }),
    ]);

    const totalActionCount = upvoteCount + duplicateFlagCount + spamFlagCount;

    return res.status(200).json({ agentCount, totalActionCount });
  } catch (error) {
    console.error(`Failed to fetch activity for address ${address}:`, error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
