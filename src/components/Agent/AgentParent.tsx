import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useSWR, { useSWRConfig } from "swr";
import { AgentCard } from "./AgentCard";
import { ActionButtonsProps, AgentParentProps, HandleAction, UserActions } from "@utils/types";
import { fetcher } from "@utils/helper-functions";
import { useAccount } from "wagmi";
import { AgentContentView } from "./AgentContentView";

export const AgentParent: React.FC<AgentParentProps> = ({ agent, cardView }) => {
  const { address, isConnected } = useAccount();
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // This effect ensures the component only renders its interactive state on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const upvoteCount = agent.upvoters.length;
  const apiUrl = isConnected ? `/api/agents/${agent.id}/actions?address=${address}` : null;
  const { data: userActions, isLoading: isLoadingUserActions } = useSWR<UserActions>(apiUrl, fetcher);

  const isUpvoted = userActions?.upvoted ?? false;
  const isDuplicateFlagged = userActions?.duplicateFlagged ?? false;
  const isSpamFlagged = userActions?.spamFlagged ?? false;

  const handleAction: HandleAction = async (e, action) => {
    e.stopPropagation();
    if (isSubmitting) return; // Prevent multiple clicks while an action is in progress

    if (!isConnected || !address) {
      toast.error("You must connect your wallet to perform this action.");
      return;
    }

    setIsSubmitting(true); // Disable buttons

    const actionMessages = {
      upvote: { active: "Agent upvoted!", inactive: "Upvote removed." },
      duplicate: { active: "Flagged as duplicate.", inactive: "Duplicate flag removed." },
      spam: { active: "Flagged as spam.", inactive: "Spam flag removed." },
    };

    const currentStates = { upvote: isUpvoted, duplicate: isDuplicateFlagged, spam: isSpamFlagged };
    const successMessage = actionMessages[action][!currentStates[action] ? "active" : "inactive"];

    // Optimistic UI update
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
      // Revalidate data after successful action
      mutate(apiUrl);
      mutate("/api/agents?sortBy=top");
      mutate("/api/agents?sortBy=new");
    } catch (error) {
      // Revert optimistic UI update on failure
      mutate(apiUrl, userActions, false);
      const errorMessage = error instanceof Error ? error.message : "An error occurred.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false); // Re-enable buttons
    }
  };

  const actionProps: ActionButtonsProps = {
    isUpvoted,
    upvoteCount,
    isDuplicateFlagged,
    isSpamFlagged,
    // Buttons are loading if the component hasn't mounted, if SWR is fetching, or if an action is submitting
    isLoading: !isMounted || isLoadingUserActions || isSubmitting,
    handleAction,
  };

  if (cardView) {
    return <AgentCard agent={agent} actionProps={actionProps} />;
  }

  return (
    <div className="relative max-h-[90vh] overflow-y-auto bg-white rounded-lg">
      <AgentContentView agent={agent} actionProps={actionProps} />
    </div>
  );
};
