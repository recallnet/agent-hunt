import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShareXModalProps } from "@utils/types";

export const ShareXModal: React.FC<ShareXModalProps> = ({ isOpen, onClose, agentData }) => {
  // Effect to manage body overflow when the modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // Cleanup function to restore body overflow
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // --- X Post Creation ---
  const handleCreateXPost = () => {
    // Start with the base text for the post.
    let postText = `I just hunted "${agentData.name}" on AgentHunt, powered by @recallnet`;

    // --- New Logic: Check for a Twitter/X URL to extract the username ---
    try {
      const twitterRegex = /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/([a-zA-Z0-9_]{1,15})/;
      const match = agentData.url.match(twitterRegex);

      // If a username is found in the agent's URL, tag them.
      if (match && match[1]) {
        postText += ` @${match[1]}`;
      }
    } catch (e) {
      // Silently ignore any regex errors and proceed without the extra tag.
      console.error("Could not parse agent URL for X handle:", e);
    }
    // End new logic

    // The specific URL of the agent's profile to be shared.
    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://agenthunt.recall.network";
    const shareUrl = `${siteUrl}/agents/${agentData.id}`;

    // Combine the text and URL with two newlines for better preview card rendering on X.
    const fullText = `${postText}.\n\n${shareUrl}`;

    // Encode the entire string for the URL parameter.
    const encodedFullText = encodeURIComponent(fullText);

    // Construct the final X intent URL.
    const xPostUrl = `https://x.com/intent/tweet?text=${encodedFullText}`;

    window.open(xPostUrl, "_blank");
  };

  return (
    // Modal backdrop
    <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-brightness-50" onClick={onClose}>
      {/* Modal content container */}
      <div
        className="bg-white rounded-lg shadow-xl relative w-full md:w-[778px] max-h-[306px] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevents modal from closing when clicking inside
      >
        <div className="p-10 flex flex-col items-center text-center">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-12 text-2xl text-gray-500 hover:text-gray-800 z-10"
            aria-label="Close modal"
          >
            ×
          </button>

          {/* Updated Modal Title */}
          <h2 className="text-2xl font-bold tracking-tighter mb-4">Share on X</h2>
          {/* Updated Modal Body Text */}
          <p className="text-base text-left">
            The more upvotes your agent gets, the more fragments you earn. Share this agent on X to drive attention to
            your find. Be sure to tag @recallnet, mention AgentHunt, and include your agent’s profile URL.
          </p>
          {/* Action Button */}
          <Button
            onClick={handleCreateXPost}
            className="mt-6 w-[184px] h-[37px] rounded-[5px] cursor-pointer bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-hover)] text-white text-lg"
          >
            Create X Post
          </Button>
        </div>
      </div>
    </div>
  );
};
