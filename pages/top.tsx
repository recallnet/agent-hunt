import useSWR from "swr";
import { AgentCard } from "@components/AgentCard";
import { EnhancedAgent } from "@utils/types";
import { fetcher } from "@utils/helper-functions";

export default function TopPage() {
  const { data: agents, error, isLoading } = useSWR<EnhancedAgent[]>("/api/agents?sortBy=top", fetcher);

  if (error) return <div>Failed to load agents. Please try again later.</div>;
  if (isLoading) return <div>Loading agents...</div>;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {agents && agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}
      </div>
    </div>
  );
}
