import React from "react";
import { ThumbsUp, Copy, CopyCheck, Shield, ShieldAlert } from "lucide-react";
import { ActionButtonsProps } from "@utils/types";

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isUpvoted,
  upvoteCount,
  isDuplicateFlagged,
  isSpamFlagged,
  isLoading,
  handleAction,
}) => {
  const buttonStyle =
    "flex flex-1 items-center justify-center h-full cursor-pointer hover:text-blue-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const activeStyle = "text-blue-600";
  const inactiveStyle = "text-gray-800";

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex flex-1 items-center justify-center">
        <button
          className={`${buttonStyle} ${isUpvoted ? activeStyle : inactiveStyle}`}
          onClick={(e) => handleAction(e, "upvote")}
          title={isUpvoted ? "Remove Upvote" : "Upvote"}
          disabled={isLoading}
        >
          <ThumbsUp className="h-5 w-5" fill={isUpvoted ? "currentColor" : "none"} />
          <span className="ml-2 text-sm text-gray-600">{upvoteCount}</span>
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <button
          className={`${buttonStyle} ${isDuplicateFlagged ? activeStyle : inactiveStyle}`}
          onClick={(e) => handleAction(e, "duplicate")}
          title={isDuplicateFlagged ? "Remove Duplicate Flag" : "Flag as Duplicate"}
          disabled={isLoading}
        >
          {isDuplicateFlagged ? <CopyCheck className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <button
          className={`${buttonStyle} ${isSpamFlagged ? activeStyle : inactiveStyle}`}
          onClick={(e) => handleAction(e, "spam")}
          title={isSpamFlagged ? "Remove Spam Flag" : "Flag as Spam"}
          disabled={isLoading}
        >
          {isSpamFlagged ? (
            <ShieldAlert className="h-5 w-5 text-red-500" fill="currentColor" />
          ) : (
            <Shield className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
};
