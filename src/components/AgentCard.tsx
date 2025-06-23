"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { ArrowUp, Flag, AlertTriangle } from "lucide-react";
import type { Agent } from "@prisma/client";

type AgentCardProps = {
  agent: Agent;
};

// A helper to format the skill for display
const formatSkill = (skill: string) => {
  return skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const { address, isConnected } = useAccount();
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isDuplicateFlagged, setIsDuplicateFlagged] = useState(false);
  const [isSpamFlagged, setIsSpamFlagged] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);

  // Fetch initial action states and upvote count
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch upvote count
        const countResponse = await fetch(`/api/agents/${agent.id}/counts`);
        if (countResponse.ok) {
          const { upvotes } = await countResponse.json();
          setUpvoteCount(upvotes);
        }

        // Fetch user actions (if logged in)
        if (isConnected && address) {
          const actionsResponse = await fetch(`/api/agents/${agent.id}/user-actions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address }),
          });
          if (actionsResponse.ok) {
            const { upvoted, duplicateFlagged, spamFlagged } = await countResponse.json();
            setIsUpvoted(upvoted);
            setIsDuplicateFlagged(duplicateFlagged);
            setIsSpamFlagged(spamFlagged);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [address, isConnected, agent.id]);

  const handleAction = async (action: "upvote" | "duplicate" | "spam") => {
    if (!isConnected || !address) {
      toast.error("You must be logged in to perform this action.");
      return;
    }

    try {
      const response = await fetch(`/api/agents/${agent.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, address }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Action failed.");
      }

      await response.json();
      if (action === "upvote") {
        setIsUpvoted(!isUpvoted);
        setUpvoteCount((prev) => (isUpvoted ? prev - 1 : prev + 1)); // Update count optimistically
        toast.success(isUpvoted ? "Upvote removed." : "Agent upvoted!");
      } else if (action === "duplicate") {
        setIsDuplicateFlagged(!isDuplicateFlagged);
        toast.success(isDuplicateFlagged ? "Duplicate flag removed." : "Flagged as duplicate.");
      } else if (action === "spam") {
        setIsSpamFlagged(!isSpamFlagged);
        toast.success(isSpamFlagged ? "Spam flag removed." : "Flagged as spam.");
      }
    } catch (error: unknown) {
      let errorMessage = "An error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  return (
    <div className="relative h-[399px] w-[346px] overflow-hidden border border-gray-200">
      {/* Background Image */}
      <Image
        src={agent.avatarUrl}
        alt={`${agent.name}'s avatar`}
        fill
        className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
        priority
      />

      {/* Semi-transparent Banner at the bottom with curved top edges */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[124px] bg-white/70 p-4"
        style={{
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
        }}
      >
        <div className="flex h-full flex-col justify-between gap-1">
          {/* Row 1: Skill */}
          <div>
            <span className="text-[16px] font-normal">{formatSkill(agent.skill)}</span>
          </div>

          {/* Row 2: Agent Name */}
          <div className="-mt-4">
            <h3 className="text-[24px] font-bold text-gray-900">{agent.name}</h3>
          </div>

          {/* Row 3: Buttons and Upvote Count */}
          <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center justify-center gap-1">
              <button
                className={`${
                  isUpvoted ? "text-[var(--brand-blue)]" : "text-black"
                } hover:text-[var(--brand-blue)] transition-colors`}
                onClick={() => handleAction("upvote")}
                title={isUpvoted ? "Remove Upvote" : "Upvote"}
              >
                <ArrowUp className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-600">{upvoteCount}</span>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <button
                className={`${
                  isDuplicateFlagged ? "text-[var(--brand-blue)]" : "text-black"
                } hover:text-[var(--brand-blue)] transition-colors`}
                onClick={() => handleAction("duplicate")}
                title={isDuplicateFlagged ? "Remove Duplicate Flag" : "Flag as Duplicate"}
              >
                <Flag className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <button
                className={`${
                  isSpamFlagged ? "text-[var(--brand-blue)]" : "text-black"
                } hover:text-[var(--brand-blue)] transition-colors`}
                onClick={() => handleAction("spam")}
                title={isSpamFlagged ? "Remove Spam Flag" : "Flag as Spam"}
              >
                <AlertTriangle className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
