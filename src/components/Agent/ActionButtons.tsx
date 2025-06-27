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
  const columnStyle = "flex flex-1 items-center justify-start";
  const buttonStyle =
    "flex items-center h-full p-2 cursor-pointer hover:text-blue-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const activeStyle = "text-blue-600";
  const inactiveStyle = "text-gray-800";
  const inactiveFillColor = "#D1D5DB";

  return (
    <div className="flex items-center justify-between w-full">
      {/* Upvote Button */}
      <div className={columnStyle}>
        <button
          className={`${buttonStyle} ${isUpvoted ? activeStyle : inactiveStyle}`}
          onClick={(e) => handleAction(e, "upvote")}
          title={isUpvoted ? "Remove Upvote" : "Upvote"}
          disabled={isLoading}
        >
          <ThumbsUp className="h-5 w-5" fill={isUpvoted ? "currentColor" : inactiveFillColor} />
          <span className="ml-2 text-sm text-gray-600">{upvoteCount}</span>
        </button>
      </div>

      {/* Duplicate Flag Button */}
      <div className={columnStyle}>
        <button
          className={`${buttonStyle} ${isDuplicateFlagged ? activeStyle : inactiveStyle}`}
          onClick={(e) => handleAction(e, "duplicate")}
          title={isDuplicateFlagged ? "Remove Duplicate Flag" : "Flag as Duplicate"}
          disabled={isLoading}
        >
          {isDuplicateFlagged ? (
            <CopyCheck className="h-5 w-5" fill="currentColor" />
          ) : (
            <Copy className="h-5 w-5" fill={inactiveFillColor} />
          )}
        </button>
      </div>

      {/* Spam Flag Button */}
      <div className={columnStyle}>
        <button
          className={`${buttonStyle} ${isSpamFlagged ? activeStyle : inactiveStyle}`}
          onClick={(e) => handleAction(e, "spam")}
          title={isSpamFlagged ? "Remove Spam Flag" : "Flag as Spam"}
          disabled={isLoading}
        >
          {isSpamFlagged ? (
            <ShieldAlert className="h-5 w-5" fill="currentColor" />
          ) : (
            <Shield className="h-5 w-5" fill={inactiveFillColor} />
          )}
        </button>
      </div>
    </div>
  );
};
