import React from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import useSWR from "swr";
import dynamic from "next/dynamic";
import { EnhancedAgent } from "@utils/types"; // Make sure this path is correct
import { fetcher } from "@utils/helper-functions";

// A simple fetcher function that SWR will use to get data.

// Dynamically import AgentParent and disable server-side rendering (SSR) for it.
// This is the key to preventing the server error.
const DynamicAgentParent = dynamic(() => import("@components/Agent/AgentParent").then((mod) => mod.AgentParent), {
  ssr: false,
});

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
        <DynamicAgentParent agent={agent} cardView={false} />
      </div>
    </>
  );
};

export default AgentPage;
