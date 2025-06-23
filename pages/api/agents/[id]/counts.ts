import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../utils/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid agent ID." });
  }

  const agentId = parseInt(id, 10);
  if (isNaN(agentId)) {
    return res.status(400).json({ error: "Invalid agent ID." });
  }

  try {
    const upvoteCount = await prisma.upvote.count({
      where: { agentId },
    });

    return res.status(200).json({ upvotes: upvoteCount });
  } catch (error) {
    console.error("Failed to fetch counts:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
