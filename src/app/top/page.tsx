import type { Agent } from "@prisma/client";
import prisma from "../../../utils/db";
import { AgentCard } from "@/components/AgentCard";

// Extends the Agent type to include the upvote count
type AgentWithUpvotes = Agent & {
  _count: {
    upvotes: number;
  };
};

async function getTopAgents(): Promise<AgentWithUpvotes[]> {
  const agents = await prisma.agent.findMany({
    orderBy: {
      upvotes: {
        _count: "desc",
      },
    },
    include: {
      author: {
        select: {
          address: true,
        },
      },
      _count: {
        select: { upvotes: true },
      },
    },
  });
  return agents;
}

export default async function TopPage() {
  const agents = await getTopAgents();

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
