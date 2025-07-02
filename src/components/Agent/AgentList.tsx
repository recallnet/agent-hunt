import useSWRInfinite from "swr/infinite";
import { EnhancedAgent, PaginatedAgentsResponse } from "@utils/types";
import { fetcher } from "@utils/helper-functions";
import { AgentParent } from "@/components/Agent/AgentParent";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";

interface AgentListProps {
  sortBy: "top" | "new";
}

const getKey = (
  pageIndex: number,
  previousPageData: PaginatedAgentsResponse | null,
  sortBy: string,
  address?: string
) => {
  // If the previous page indicated there are no more results, we return null to stop fetching.
  if (previousPageData && !previousPageData.hasMore) return null;

  const page = pageIndex + 1;
  const baseUrl = `/api/agents?sortBy=${sortBy}&page=${page}`;

  // Append the user's address to the URL if they are connected
  return address ? `${baseUrl}&address=${address}` : baseUrl;
};

export const AgentList: React.FC<AgentListProps> = ({ sortBy }) => {
  const { address } = useAccount(); // Get the connected wallet address

  // `useSWRInfinite` fetches data from the paginated API.
  const { data, error, isLoading, size, setSize, isValidating, mutate } = useSWRInfinite<PaginatedAgentsResponse>(
    (index, prevData) => getKey(index, prevData, sortBy, address), // Pass address to the key function
    fetcher
  );

  const agents: EnhancedAgent[] = data ? data.flatMap((page) => page.agents).filter(Boolean) : [];

  const hasMore = data ? data[data.length - 1]?.hasMore : false;
  const isFetchingMore = isLoading || (isValidating && data && data.length === size);

  if (error) {
    return <div className="text-center mt-10">Failed to load agents. Please try again later.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center mt-20">
        <Spinner className="w-12 h-12 text-brand-blue" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xxl mx-auto">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-0 justify-center">
        {agents.map((agent) => (
          <AgentParent key={agent.id} agent={agent} cardView={true} mutateList={mutate} />
        ))}
      </div>

      <div className="text-center my-10">
        {hasMore && (
          <Button onClick={() => setSize(size + 1)} disabled={isFetchingMore} className="w-40">
            {isFetchingMore ? <Spinner className="w-6 h-6" /> : "Load More"}
          </Button>
        )}
      </div>
    </div>
  );
};
