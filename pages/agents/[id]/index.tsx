import React from "react";
import Image from "next/image";
import Head from "next/head";
import { useRouter } from "next/router";
import useSWR from "swr";
import { EnhancedAgent } from "@utils/types";
import { Label } from "@/components/ui/label";
import { fetcher } from "@utils/helper-functions";

// Helper component for displaying labeled information
const InfoField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <Label className="text-base font-bold">{label}</Label>
    <div className="mt-2 text-gray-800 text-base">{children}</div>
  </div>
);

const AgentProfilePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  // Fetch the agent data using SWR
  const { data: agent, error, isLoading } = useSWR<EnhancedAgent>(id ? `/api/agents?id=${id}` : null, fetcher);

  // Base URL for absolute image paths (use environment variable in production)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://agenthunt.recall.network";

  // Default meta tag values
  const defaultTitle = "Agent Profile";
  const defaultDescription = "View the details of this agent.";
  const defaultImage = "/agent-icon.png"; // Changed to PNG for broader compatibility

  // Construct absolute image URL
  const imageUrl = agent?.avatarUrl?.startsWith("http")
    ? agent.avatarUrl
    : `${baseUrl}${agent?.avatarUrl || defaultImage}`;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Meta tags for SEO and social sharing */}
      <Head>
        <title>{agent?.name || defaultTitle}</title>
        <meta name="description" content={agent?.description || defaultDescription} />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={agent?.name || defaultTitle} />
        <meta property="og:description" content={agent?.description || defaultDescription} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content={agent?.name ? `${agent.name}'s avatar` : "Default agent profile avatar"}
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${baseUrl}/agents/${id}`} />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={agent?.name || defaultTitle} />
        <meta name="twitter:description" content={agent?.description || defaultDescription} />
        <meta property="twitter:image" content={imageUrl} />
      </Head>

      <main className="flex flex-1 flex-col items-center justify-center p-4">
        {isLoading && (
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Loading Agent...</h1>
            <p className="text-lg text-gray-600">Please wait while we fetch the agent details.</p>
          </div>
        )}
        {error && (
          <div className="text-red-500 text-center">
            <h1 className="text-4xl font-bold mb-4">Error</h1>
            <p className="text-lg">Failed to load agent data. Please try again later.</p>
          </div>
        )}
        {agent && (
          <div className="w-full max-w-4xl mx-auto">
            <div className="p-10 md:p-12">
              <h2 className="text-2xl font-bold tracking-tighter mb-8">Agent Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-[204px_1fr] md:gap-x-6">
                <div className="md:col-start-2 md:row-start-1 mb-6 md:mb-0 relative">
                  <InfoField label="Agent Name">{agent.name}</InfoField>
                </div>
                <div className="md:col-start-1 md:row-start-1 mb-6">
                  <Label className="text-base font-bold">Avatar</Label>
                  <div className="relative overflow-hidden mt-2 w-full h-[201px] rounded-[5px]">
                    <Image
                      src={agent.avatarUrl}
                      alt={`${agent.name}'s avatar`}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `${baseUrl}${defaultImage}`;
                      }} // Fallback for broken images
                    />
                  </div>
                </div>
                <div className="md:col-start-1 md:row-start-2 mb-6">
                  <InfoField label="Skill">
                    <span className="capitalize">{agent.skill.toLowerCase()}</span>
                  </InfoField>
                </div>
                <div className="md:col-start-2 md:row-start-2 mb-6 md:relative md:-top-[150px]">
                  <InfoField label="X Account">
                    <a
                      href={agent.xAccount}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {agent.xAccount}
                    </a>
                  </InfoField>
                </div>
                <div className="md:col-start-2 md:row-start-3 mb-6 md:relative md:-top-[150px]">
                  <InfoField label="Description">
                    <p className="whitespace-pre-wrap">{agent.description}</p>
                  </InfoField>
                </div>
                <div className="md:col-start-2 md:row-start-4 mb-6 md:relative md:-top-[150px]">
                  <InfoField label="Why did you hunt this agent?">
                    <p className="whitespace-pre-wrap">{agent.whyHunt}</p>
                  </InfoField>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AgentProfilePage;
