import React, { useState } from "react";
import { ArrowBigUp, TriangleAlert, Flag } from "lucide-react";
import { ActionButtonsProps } from "@utils/types";
import { ActionReasonModal } from "@components/Modals/ActionReasonModal";

type ActionType = "upvote" | "duplicate" | "spam";

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isUpvoted,
  upvoteCount,
  isDuplicateFlagged,
  isSpamFlagged,
  isLoading,
  handleAction,
}) => {
  const [modalAction, setModalAction] = useState<ActionType | null>(null);

  const columnStyle = "flex flex-1 items-center justify-start";
  const buttonStyle =
    "flex items-center h-full p-1 hover:text-blue-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none cursor-default";
  const activeStyle = "text-blue-600";
  const inactiveStyle = "text-gray-800";
  const inactiveFillColor = "#D1D5DB";

  const handleClick = (e: React.MouseEvent<HTMLElement>, action: ActionType, isCurrentlyActive: boolean) => {
    e.stopPropagation();
    // If the action is already active, we are removing it. Call handleAction directly.
    if (isCurrentlyActive) {
      handleAction(e, action);
    } else {
      // Otherwise, we are adding a new action. Open the modal.
      setModalAction(action);
    }
  };

  const handleSubmitReason = (reason: string) => {
    if (modalAction) {
      // The event is null because it originates from the modal, not the button.
      handleAction(null, modalAction, reason);
    }
    setModalAction(null); // Close modal on submit
  };

  return (
    <>
      <div className="flex items-center justify-between w-full">
        {/* The onClick handler on this div stops the click from propagating to the parent card */}
        <div className={columnStyle} onClick={(e) => e.stopPropagation()}>
          <button
            className={`${buttonStyle} ${isUpvoted ? activeStyle : inactiveStyle}`}
            title={isUpvoted ? "Remove Upvote" : "Upvote"}
            disabled={isLoading}
            onClick={(e) => handleClick(e, "upvote", isUpvoted)}
          >
            <span>
              <ArrowBigUp className="h-5 w-5 cursor-pointer" fill={isUpvoted ? "currentColor" : inactiveFillColor} />
            </span>
            <span className="ml-1 text-sm text-gray-600 cursor-pointer">{upvoteCount}</span>
          </button>
        </div>

        {/* Duplicate Flag Button */}
        <div className={columnStyle} onClick={(e) => e.stopPropagation()}>
          <button
            className={`${buttonStyle} ${isDuplicateFlagged ? activeStyle : inactiveStyle}`}
            title={isDuplicateFlagged ? "Remove Duplicate Flag" : "Flag as Duplicate"}
            disabled={isLoading}
            onClick={(e) => handleClick(e, "duplicate", isDuplicateFlagged)}
          >
            <span>
              <TriangleAlert
                className="h-5 w-5 cursor-pointer"
                fill={isDuplicateFlagged ? "currentColor" : inactiveFillColor}
                stroke={isDuplicateFlagged ? "white" : "black"}
              />
            </span>
          </button>
        </div>

        {/* Spam Flag Button */}
        <div className={columnStyle} onClick={(e) => e.stopPropagation()}>
          <button
            className={`${buttonStyle} ${isSpamFlagged ? activeStyle : inactiveStyle}`}
            title={isSpamFlagged ? "Remove Spam Flag" : "Flag as Spam"}
            disabled={isLoading}
            onClick={(e) => handleClick(e, "spam", isSpamFlagged)}
          >
            <span>
              <Flag className="h-5 w-5 cursor-pointer" fill={isSpamFlagged ? "currentColor" : inactiveFillColor} />
            </span>
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
