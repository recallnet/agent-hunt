import React, { useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { ThumbsUp, Copy, CopyCheck, Shield, ShieldAlert } from "lucide-react";
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@utils/helper-functions";
import { EnhancedAgent } from "@utils/types";
import { AgentInfoModal } from "./AgentInfoModal";

type AgentCardProps = {
  agent: EnhancedAgent;
};

// Define a type for the user actions data
type UserActions = {
  upvoted: boolean;
  duplicateFlagged: boolean;
  spamFlagged: boolean;
};

const formatSkill = (skill: string) => {
  if (!skill) return "";
  return skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const { address, isConnected } = useAccount();
  const { mutate } = useSWRConfig();
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);

  const upvoteCount = agent._count.upvotes;
  const apiUrl = isConnected ? `/api/agents/${agent.id}/actions?address=${address}` : null;
  const { data: userActions, isLoading: isLoadingUserActions } = useSWR<UserActions>(apiUrl, fetcher);

  const isUpvoted = userActions?.upvoted ?? false;
  const isDuplicateFlagged = userActions?.duplicateFlagged ?? false;
  const isSpamFlagged = userActions?.spamFlagged ?? false;

  const handleAction = async (e: React.MouseEvent, action: "upvote" | "duplicate" | "spam") => {
    e.stopPropagation(); // Stop click from bubbling up to the card's onClick
    if (!isConnected || !address) {
      toast.error("You must be logged in to perform this action.");
      return;
    }

    let successMessage = "Action successful!";
    if (action === "upvote") {
      successMessage = isUpvoted ? "Upvote removed." : "Agent upvoted!";
    } else if (action === "duplicate") {
      successMessage = isDuplicateFlagged ? "Duplicate flag removed." : "Flagged as duplicate.";
    } else if (action === "spam") {
      successMessage = isSpamFlagged ? "Spam flag removed." : "Flagged as spam.";
    }

    mutate(
      apiUrl,
      (currentData: UserActions | undefined) => ({
        ...(currentData || { upvoted: false, duplicateFlagged: false, spamFlagged: false }),
        upvoted: action === "upvote" ? !isUpvoted : isUpvoted,
        duplicateFlagged: action === "duplicate" ? !isDuplicateFlagged : isDuplicateFlagged,
        spamFlagged: action === "spam" ? !isSpamFlagged : isSpamFlagged,
      }),
      false
    );

    try {
      const response = await fetch(`/api/agents/${agent.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, address }),
      });
      if (!response.ok) {
        throw new Error((await response.json()).error || "The action failed.");
      }
      toast.success(successMessage);
      mutate(apiUrl);
      mutate("/api/agents?sortBy=top");
      mutate("/api/agents?sortBy=new");
    } catch (error) {
      mutate(apiUrl, userActions, false);
      const errorMessage = error instanceof Error ? error.message : "An error occurred.";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <div className="relative h-[399px] w-[346px] overflow-hidden border border-gray-200 group transition-all duration-300 hover:shadow-glow">
        <div className="relative w-full h-full cursor-pointer" onClick={() => setInfoModalOpen(true)}>
          <Image
            src={agent.avatarUrl}
            alt={`${agent.name}'s avatar`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            priority
          />
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-[124px] bg-white/85 p-4 cursor-default"
          style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-full flex-col justify-between gap-1">
            <div>
              <span className="text-[16px] font-normal">{formatSkill(agent.skill)}</span>
            </div>
            <div className="-mt-4">
              <h3 className="text-[24px] font-bold text-gray-900">{agent.name}</h3>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-1 items-center justify-center">
                <button
                  className={`flex items-center justify-center gap-2 w-full h-full cursor-pointer ${
                    isUpvoted ? "text-[var(--brand-blue)]" : "text-black"
                  } hover:text-[var(--brand-blue)] transition-colors`}
                  onClick={(e) => handleAction(e, "upvote")}
                  title={isUpvoted ? "Remove Upvote" : "Upvote"}
                  disabled={isLoadingUserActions}
                >
                  <ThumbsUp className="h-5 w-5" fill={isUpvoted ? "currentColor" : "none"} />
                  <span className="text-sm text-gray-600">{upvoteCount}</span>
                </button>
              </div>
              <div className="flex flex-1 items-center justify-center">
                <button
                  className={`w-full h-full flex items-center justify-center cursor-pointer ${
                    isDuplicateFlagged ? "text-[var(--brand-blue)]" : "text-black"
                  } hover:text-[var(--brand-blue)] transition-colors`}
                  onClick={(e) => handleAction(e, "duplicate")}
                  title={isDuplicateFlagged ? "Remove Duplicate Flag" : "Flag as Duplicate"}
                  disabled={isLoadingUserActions}
                >
                  {isDuplicateFlagged ? <CopyCheck className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
              <div className="flex flex-1 items-center justify-center">
                <button
                  className={`w-full h-full flex items-center justify-center cursor-pointer ${
                    isSpamFlagged ? "text-[var(--brand-blue)]" : "text-black"
                  } hover:text-[var(--brand-blue)] transition-colors`}
                  onClick={(e) => handleAction(e, "spam")}
                  title={isSpamFlagged ? "Remove Spam Flag" : "Flag as Spam"}
                  disabled={isLoadingUserActions}
                >
                  {isSpamFlagged ? (
                    <ShieldAlert className="h-5 w-5" fill="currentColor" />
                  ) : (
                    <Shield className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AgentInfoModal isOpen={isInfoModalOpen} onClose={() => setInfoModalOpen(false)} agent={agent} />
    </>
  );
};
