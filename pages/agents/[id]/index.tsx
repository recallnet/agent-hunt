import React from "react";
import type { NextPage } from "next";
import Head from "next/head";
import router, { useRouter } from "next/router";
import useSWR from "swr";
import dynamic from "next/dynamic";
import { EnhancedAgent } from "@utils/types"; // Make sure this path is correct
import { fetcher } from "@utils/helper-functions";
import { Button } from "@/components/ui/button";

// A simple fetcher function that SWR will use to get data.

// Dynamically import AgentParent. We adjust the import path to match the component name.
const DynamicAgentParent = dynamic(() => import("@components/Agent/AgentParent").then((mod) => mod.AgentParent), {
  ssr: false,
});

const handleAllAgentsClick = () => {
  router.push("/"); // Redirect to homepage
};

const AgentPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  // Use SWR to fetch the agent data on the client side.
  // The API call will only run once the `id` is available from the router.
  const { data: agent, error } = useSWR<EnhancedAgent>(id ? `/api/agents?id=${id}` : null, fetcher);

  // 1. Handle the error state
  if (error) return <div>Failed to load agent.</div>;

  // 2. Handle the loading state (when `agent` data is not yet available)
  if (!agent) return <div>Loading...</div>;

  // 3. Once data is successfully loaded, render the page
  return (
    <>
      <Head>
        <title>{agent.name} | Agent Details</title>
      </Head>

      <div className="container mx-auto max-w-4xl py-8 px-4 md:px-0">
        <DynamicAgentParent agent={agent} cardView={false} disableScroll={true} />
        <div className="flex justify-center items-center">
          <Button
            variant="default" // Changed from outline to default for stronger visual appeal
            className="cursor-pointer mt-6 text-sm font-semibold px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg rounded-full"
            onClick={handleAllAgentsClick}
          >
            Explore All Agents
          </Button>
        </div>
      </div>
    </>
  );
};

export default AgentPage;
