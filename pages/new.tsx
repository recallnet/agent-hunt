import useSWR from "swr";
import { EnhancedAgent } from "@utils/types";
import { fetcher } from "@utils/helper-functions";
import { AgentParent } from "@/components/Agent/AgentParent";

export default function NewPage() {
  const { data: agents, error, isLoading } = useSWR<EnhancedAgent[]>("/api/agents?sortBy=new", fetcher);
  console.log(agents);

  if (error) return <div>Failed to load agents. Please try again later.</div>;
  if (isLoading) return <div>Loading agents...</div>;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {agents && agents.map((agent) => <AgentParent key={agent.id} agent={agent} cardView={true} />)}
      </div>
    </div>
  );
}
