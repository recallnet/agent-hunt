import React from "react";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic"; // Import 'dynamic' from Next.js
import { EnhancedAgent } from "@utils/types";

// Create a simple loading skeleton component
const AgentLoadingSkeleton = () => (
  <div className="container mx-auto max-w-4xl py-8 px-4 md:px-0 animate-pulse">
    <div className="h-[161px] w-full rounded-t-lg bg-gray-200" />
    <div className="p-12 md:p-14">
      <div className="flex flex-col md:flex-row gap-8 md:gap-10">
        <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center gap-4">
          <div className="-mt-[160px] w-[204px] h-[204px] relative rounded-lg bg-gray-300 shadow-lg" />
          <div className="w-[204px] h-[51px] rounded-[5px] bg-gray-200 mt-[20px]" />
        </div>
        <div className="flex-grow mt-0 md:-mt-8">
          <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
          <div className="w-[204px] h-[40px] mt-[25px] bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

// Dynamically import AgentParent with SSR turned off
const DynamicAgentParent = dynamic(() => import("@components/Agent/AgentParent").then((mod) => mod.AgentParent), {
  ssr: false, // This is the key: it prevents the component from rendering on the server
  loading: () => <AgentLoadingSkeleton />, // Show a nice skeleton while the component loads on the client
});

interface AgentPageProps {
  agent: EnhancedAgent | null;
  error?: string;
}

const AgentPage: NextPage<AgentPageProps> = ({ agent, error }) => {
  if (error || !agent) {
    return (
      <div className="container mx-auto text-center py-20">
        <h1 className="text-2xl font-bold">Could Not Load Agent</h1>
        <p className="text-muted-foreground">{error || "The requested agent could not be found."}</p>
      </div>
    );
  }

  const siteName = "Recall Agent Hunt";
  const pageTitle = `${agent.name} | ${siteName}`;
  const pageDescription =
    agent.description.length > 160 ? `${agent.description.substring(0, 157)}...` : agent.description;

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://agenthunt.recall.network";
  const pageUrl = `${siteUrl}/agent/${agent.id}`;
  const fallbackImageUrl = `${siteUrl}/agent-fallback-icon.png`;
  const previewImageUrl = agent.avatarUrl || fallbackImageUrl;
  const twitterHandle = "@recallnet";

  return (
    <>
      <Head>
        {/* --- Primary Meta Tags --- */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />

        {/* --- Open Graph / Facebook Meta Tags --- */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={previewImageUrl} />
        <meta property="og:site_name" content={siteName} />

        {/* --- Twitter Card Meta Tags --- */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={pageUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={previewImageUrl} />
        <meta name="twitter:site" content={twitterHandle} />
      </Head>

      {/* Use the dynamically loaded component here */}
      <div className="container mx-auto max-w-4xl py-8 px-4 md:px-0">
        <DynamicAgentParent agent={agent} cardView={false} />
      </div>
    </>
  );
};

// Fetch data on the server for each request to ensure it's fresh and SEO-friendly
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params || {};
  // Define the base URL for server-side fetching
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://agenthunt.recall.network";

  if (!id || typeof id !== "string" || isNaN(parseInt(id))) {
    return { notFound: true }; // Render the 404 page for invalid IDs
  }

  try {
    const res = await fetch(`${siteUrl}/api/agents?id=${id}`);

    if (!res.ok) {
      if (res.status === 404) {
        return { notFound: true };
      }
      throw new Error(`API responded with status: ${res.status}`);
    }

    const agent: EnhancedAgent = await res.json();

    return {
      props: {
        agent,
      },
    };
  } catch (e) {
    const error = e instanceof Error ? e.message : "An unknown error occurred.";
    console.error(`Failed to fetch agent data for ID ${id}:`, error);
    return { props: { agent: null, error: "Could not load agent data." } };
  }
};

export default AgentPage;
