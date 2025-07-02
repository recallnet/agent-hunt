import React, { useState } from "react";
import { ArrowBigUp, TriangleAlert, Flag } from "lucide-react";
import { ActionButtonsProps } from "@utils/types";
import { ActionReasonModal } from "@components/Modals/ActionReasonModal";
import toast from "react-hot-toast";

type ActionType = "upvote" | "duplicate" | "spam";

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isUpvoted,
  upvoteCount,
  isDuplicateFlagged,
  duplicateFlagCount,
  isSpamFlagged,
  spamFlagCount,
  isLoading,
  handleAction,
  isConnected,
  address,
}) => {
  const [modalAction, setModalAction] = useState<ActionType | null>(null);
  const [hovered, setHovered] = useState<ActionType | null>(null);

  const columnStyle = "flex flex-1 items-center justify-start";
  const buttonStyle =
    "flex items-center h-full p-1 hover:text-blue-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none cursor-default";
  const activeStyle = "text-blue-600";
  const inactiveStyle = "text-gray-800";
  const greyFillColor = "#4B5563"; // Grey fill for inactive state (gray-600)
  const greyStrokeColor = "#4B5563"; // Grey stroke for inactive state (gray-600)
  const blueColor = "#2563EB"; // Blue-600 for hover/active fill and stroke

  const handleClick = async (e: React.MouseEvent<HTMLElement>, action: ActionType, isCurrentlyActive: boolean) => {
    e.stopPropagation();

    if (!isConnected || !address) {
      toast.error("Please connect your wallet to perform this action.");
      return;
    }

    // If user is undoing an action, let them proceed without a rate limit check.
    if (isCurrentlyActive) {
      handleAction(e, action);
    } else {
      // If user is performing a new action, check the rate limit first.
      try {
        const response = await fetch(`/api/users/${address}/activity-check`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not check activity limit.");
        }

        if (data.totalActionCount >= 10) {
          toast.error("You have reached the limit of 10 actions per 24 hours.");
          return;
        }
        // If the limit is not reached, open the modal to get a reason.
        setModalAction(action);
      } catch (error) {
        const msg = error instanceof Error ? error.message : "An unexpected error occurred.";
        toast.error(msg);
      }
    }
  };

  const handleSubmitReason = (reason: string) => {
    if (modalAction) {
      handleAction(null, modalAction, reason);
    }
    setModalAction(null);
  };

  return (
    <>
      <div className="flex items-center justify-between w-full">
        {/* Upvote Button */}
        <div
          className={columnStyle}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => setHovered("upvote")}
          onMouseLeave={() => setHovered(null)}
        >
          <button
            className={`${buttonStyle} ${isUpvoted ? activeStyle : inactiveStyle}`}
            title={isUpvoted ? "Remove Upvote" : "Upvote"}
            disabled={isLoading}
            onClick={(e) => handleClick(e, "upvote", isUpvoted)}
          >
            <span>
              <ArrowBigUp
                className="h-7 w-7 cursor-pointer"
                fill={isUpvoted ? "currentColor" : hovered === "upvote" ? blueColor : greyFillColor}
                stroke={isUpvoted || hovered === "upvote" ? blueColor : greyStrokeColor}
              />
            </span>
            <span className="ml-1 text-sm text-gray-600 cursor-pointer">{upvoteCount}</span>
          </button>
        </div>

        {/* Duplicate Flag Button */}
        <div
          className={columnStyle}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => setHovered("duplicate")}
          onMouseLeave={() => setHovered(null)}
        >
          <button
            className={`${buttonStyle} ${isDuplicateFlagged ? activeStyle : inactiveStyle}`}
            title={isDuplicateFlagged ? "Remove Duplicate Flag" : "Flag as Duplicate"}
            disabled={isLoading}
            onClick={(e) => handleClick(e, "duplicate", isDuplicateFlagged)}
          >
            <span>
              <Flag
                className="h-5 w-5 cursor-pointer"
                fill={isDuplicateFlagged ? "currentColor" : hovered === "duplicate" ? blueColor : greyFillColor}
                stroke={isDuplicateFlagged || hovered === "duplicate" ? blueColor : greyStrokeColor}
              />
            </span>
            <span className="ml-2 text-sm text-gray-600 cursor-pointer">{duplicateFlagCount}</span>
          </button>
        </div>

        {/* Spam Flag Button */}
        <div
          className={columnStyle}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => setHovered("spam")}
          onMouseLeave={() => setHovered(null)}
        >
          <button
            className={`${buttonStyle} ${isSpamFlagged ? activeStyle : inactiveStyle}`}
            title={isSpamFlagged ? "Remove Spam Flag" : "Flag as Spam"}
            disabled={isLoading}
            onClick={(e) => handleClick(e, "spam", isSpamFlagged)}
          >
            <span>
              <TriangleAlert
                className="h-5 w-5 cursor-pointer"
                fill={isSpamFlagged ? "currentColor" : hovered === "spam" ? blueColor : "#D1D5DB"}
                stroke={isSpamFlagged ? "white" : "black"}
              />
            </span>
            <span className="ml-2 text-sm text-gray-600 cursor-pointer">{spamFlagCount}</span>
          </button>
        </div>
      </div>

      {modalAction && (
        <ActionReasonModal
          isOpen={!!modalAction}
          onClose={() => setModalAction(null)}
          onSubmit={handleSubmitReason}
          actionType={modalAction}
          isSubmitting={isLoading}
        />
      )}
    </>
  );
};
