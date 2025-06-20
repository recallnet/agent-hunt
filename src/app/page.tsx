"use client"; // This must be a client component to use hooks

import useSWR from "swr";
import type { Agent } from "@prisma/client";
import { AgentCard } from "@/components/AgentCard";

// A simple fetcher function for public APIs.
// SWR will use this to fetch the data.
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    // Attach extra info to the error object.
    const errorInfo = await res.json();
    console.error(errorInfo);
    throw error;
  }
  return res.json();
};

export default function Home() {
  // Use the SWR hook to fetch data.
  // It returns data, error, and isLoading states.
  const { data: agents, error, isLoading } = useSWR<Agent[]>("/api/agents", fetcher);

  // Show a loading state while data is being fetched.
  if (isLoading) {
    return <div className="container mx-auto flex flex-grow items-center justify-center">Loading Agents...</div>;
  }

  // Show an error message if the fetch fails.
  if (error) {
    return (
      <div className="container mx-auto flex flex-grow items-center justify-center text-red-500">
        Error: Failed to load agents.
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-grow flex-col items-center gap-8 py-12">
      {/* Grid of Agent Cards */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {agents?.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {/* Show a message if there are no agents to display */}
      {agents?.length === 0 && !isLoading && <p>No agents have been hunted yet. Be the first!</p>}
    </div>
  );
}
