import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AgentCard } from "./AgentCard";
import { ActionButtonsProps, AgentParentProps, HandleAction } from "@utils/types";
import { useAccount } from "wagmi";
import { AgentContentView } from "./AgentContentView";

export const AgentParent: React.FC<AgentParentProps> = ({ agent, cardView, mutateList }) => {
  const { address, isConnected } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // This effect ensures the component only renders its interactive state on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const upvoteCount = agent.upvoters.length;
  const duplicateFlagCount = agent.duplicateFlags.length;
  const spamFlagCount = agent.spamFlags.length;

  // The user's action status now comes directly from the agent prop.
  const isUpvoted = agent.isUpvoted ?? false;
  const isDuplicateFlagged = agent.isDuplicateFlagged ?? false;
  const isSpamFlagged = agent.isSpamFlagged ?? false;

  const handleAction: HandleAction = async (e, action, reason) => {
    e?.stopPropagation();
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

    // With the new efficient data fetching, client-side optimistic updates are no longer needed
    // as the revalidation is now very fast.

    try {
      await fetch(`/api/agents/${agent.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, address, reason }),
      });
      toast.success(successMessage);
      // Revalidate the entire list data after a successful action.
      await mutateList?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred.";
      toast.error(errorMessage);
      // On failure, still revalidate to sync with the server's true state.
      await mutateList?.();
    } finally {
      setIsSubmitting(false); // Re-enable buttons after all actions and revalidations are done
    }
  };

  const actionProps: ActionButtonsProps = {
    isUpvoted,
    upvoteCount,
    isDuplicateFlagged,
    duplicateFlagCount,
    isSpamFlagged,
    spamFlagCount,
    // The main loading state is now just `isSubmitting` as the initial load is handled by the parent.
    isLoading: !isMounted || isSubmitting,
    handleAction,
    isConnected,
    address,
  };

  if (cardView) {
    return <AgentCard agent={agent} actionProps={actionProps} mutateList={mutateList} />;
  }

  return (
    <div className="relative max-h-[90vh] bg-white rounded-lg">
      <AgentContentView agent={agent} actionProps={actionProps} />
    </div>
  );
};
