import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Agent } from "@prisma/client";

interface ShareXModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentData: Pick<Agent, "id" | "name" | "xAccount" | "description" | "whyHunt" | "skill"> & {
    agentHandle?: string;
  };
}

export const ShareXModal: React.FC<ShareXModalProps> = ({ isOpen, onClose, agentData }) => {
  // Effect to manage body overflow
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // --- X Post Creation ---
  const handleCreateXPost = () => {
    // The text content for the tweet, which remains unchanged.
    const agentHandle = agentData.agentHandle || agentData.xAccount.split("/").pop() || agentData.name;
    const postText = `Check out this new agent added to Recall’s agent hunt\n@${agentHandle} @recallnet`;

    // The specific URL to be used for the preview card.
    const shareUrl = `https://agenthunt.recall.network/agents/${agentData.id}`;

    // Encode the components for the final URL.
    const encodedPostText = encodeURIComponent(postText);
    const encodedShareUrl = encodeURIComponent(shareUrl);

    // Add the `url` parameter to the intent link. This tells X which URL to preview
    // without altering the pre-filled text.
    const xPostUrl = `https://x.com/intent/tweet?text=${encodedPostText}&url=${encodedShareUrl}`;

    window.open(xPostUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-brightness-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl relative w-full md:w-[778px] max-h-[306px] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-10 flex flex-col items-center text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-12 text-2xl text-gray-500 hover:text-gray-800 z-10"
            aria-label="Close modal"
          >
            ×
          </button>

          <h2 className="text-2xl font-bold tracking-tighter mb-4">Share your find</h2>
          <p className="text-base text-left">
            Create a post on X about the agent you hunted. Be sure to mention @recallnet to earn rewards in our
            incentivized <span className="font-bold">Battle of the Minds</span> yap-to-earn campaign with Cookie.
          </p>
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
