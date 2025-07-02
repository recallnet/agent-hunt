import React from "react";
import Image from "next/image";
import { useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";
import { ActionButtons } from "./ActionButtons";
import { formatSkill } from "@utils/helper-functions";
import { AgentCardProps, skills } from "@utils/types";

const MAX_DISPLAY_COUNT = 16;

type UpvoterItemProps = {
  address: `0x${string}`;
};

const UpvoterItem: React.FC<UpvoterItemProps> = ({ address }) => {
  const { data: ensName, isLoading } = useEnsName({
    address: address,
    chainId: mainnet.id,
  });

  const truncateAddress = (addr: string): string => {
    if (addr.length < 12) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const displayName = isLoading || !ensName ? truncateAddress(address) : ensName;

  return (
    <div className="flex items-center gap-2" title={address}>
      {/* This can be updated to a user-specific avatar in the future if desired */}
      <Image src="/circle-icon.svg" alt="Upvoter icon" width={25} height={24} />
      <span style={{ color: "var(--brand-gray-text)" }}>{displayName}</span>
    </div>
  );
};

export const AgentContentView: React.FC<AgentCardProps> = ({ agent, actionProps }) => {
  const formattedDate = new Date(agent.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const skillLabel = skills.find((s) => s.value === agent.skill)?.label || formatSkill(agent.skill);

  return (
    <div className="bg-white rounded-lg w-full max-w-[800px] mx-auto">
      {/* Banner */}
      <div
        className="h-[161px] w-full rounded-t-lg"
        style={{ background: "linear-gradient(90deg, #1A1A1A 0%, #000000 100%)" }}
      />

      {/* Main Content Area */}
      <div className="p-12 md:p-14">
        <div className="flex flex-col md:flex-row gap-8 md:gap-10">
          {/* Left Column: Avatar & Skill */}
          <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center gap-4">
            {/* --- AVATAR SECTION (MODIFIED) --- */}
            <div
              className="-mt-[160px] w-[204px] h-[204px] relative shadow-lg"
            >
              {/* This div acts as the rectangular background */}
              <div
                className="absolute inset-0"
                style={{ background: "var(--avatar-fallback-background, #F3F4F6)" }}
              />

              {/* The Image is placed on top of the background div */}
              <Image
                src={agent.avatarUrl}
                alt={`${agent.name}'s avatar`}
                fill
                sizes="204px"
                className="object-cover"
                style={{
                  clipPath: 'inset(0)' // Ensures the image is clipped to a rectangle
                }}
                priority
              />
            </div>
            {/* --- END OF AVATAR SECTION --- */}

            {/* Agent Skill Box */}
            <div
              className="w-[204px] h-[51px] rounded-[5px] flex items-center justify-center p-2 mt-[20px]"
              style={{ backgroundColor: "var(--brand-gray, #F3F4F6)" }}
            >
              <span className="font-bold text-base text-center">{skillLabel}</span>
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="flex-grow mt-0 md:-mt-8">
            <h2 className="text-2xl font-bold text-gray-900">{agent.name}</h2>
            <a
              href={agent.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base"
              style={{ color: "var(--brand-blue)" }}
            >
              {agent.url}
            </a>
            <div className="relative h-[60px]">
              <p
                className="mt-4 text-base leading-relaxed line-clamp-2 absolute top-0"
                style={{ color: "var(--brand-gray-text)" }}
              >
                {agent.description}
              </p>
            </div>
            <div className="w-full max-w-[204px] mt-[25px]">
              <ActionButtons {...actionProps} />
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-200 w-full" />

        {/* Hunted By Section */}
        <div className="w-full">
          <div className="flex justify-between items-center text-md mb-2">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold">Hunted By</h3>
              <UpvoterItem address={agent.authorAddress as `0x${string}`} />
            </div>
            <div className="flex items-center gap-2">
              <p style={{ color: "var(--brand-gray-text)" }}>{formattedDate}</p>
            </div>
          </div>
          <div>
            <p style={{ color: "var(--brand-gray-text)" }}>{agent.whyHunt}</p>
          </div>
        </div>

        {/* Upvoted By Section */}
        {agent.upvoters && agent.upvoters.length > 0 && (
          <>
            <hr className="my-8 border-gray-200 w-full" />
            <div className="w-full">
              <h3 className="text-md font-semibold mb-4">Upvoted By</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
                {agent.upvoters.slice(0, MAX_DISPLAY_COUNT).map((address) => (
                  <UpvoterItem key={address} address={address as `0x${string}`} />
                ))}
              </div>
              {agent.upvoters.length > MAX_DISPLAY_COUNT && (
                <p className="text-sm mt-4" style={{ color: "var(--brand-gray-text)" }}>
                  + {agent.upvoters.length - MAX_DISPLAY_COUNT} others
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};