import useSWR from "swr";
import { EnhancedAgent } from "@utils/types";
import { fetcher } from "@utils/helper-functions";
import { AgentParent } from "@/components/Agent/AgentParent";

export default function TopPage() {
  const { data: agents, error, isLoading } = useSWR<EnhancedAgent[]>("/api/agents?sortBy=top", fetcher);

  if (error) return <div>Failed to load agents. Please try again later.</div>;
  if (isLoading) return <div>Loading agents...</div>;

  return (
    <div className="w-full max-w-screen-xxl mx-auto">
      <div className="grid grid-cols-[repeat(auto-fit,346px)] gap-0 justify-center">
        {agents && agents.map((agent) => <AgentParent key={agent.id} agent={agent} cardView={true} />)}
      </div>
    </div>
  );
}
