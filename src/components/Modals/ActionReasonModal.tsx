import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { ModalBase } from "@/components/Modals/ModalBase";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { primaryButtonClasses } from "@/components/ui/styles";

type ActionType = "upvote" | "duplicate" | "spam";

interface ActionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  actionType: ActionType;
  isSubmitting: boolean;
}

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://agenthunt.recall.network";
const exampleUrl = `${siteUrl}/agents/123`;

export const ActionReasonModal: React.FC<ActionReasonModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  actionType,
  isSubmitting,
}) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen]);

  const modalContent = {
    upvote: {
      title: "Why are you upvoting?",
      label: "Reason (Required)",
      placeholder: "e.g., This agent has been super helpful for my research.",
      inputType: "textarea" as const,
      maxLength: 280,
    },
    duplicate: {
      title: "Flag as Duplicate",
      label: "URL of Original Agent",
      placeholder: exampleUrl,
      inputType: "input" as const,
    },
    spam: {
      title: "Flag as Spam",
      label: "Reason (Optional)",
      placeholder: "e.g., The agent's URL is broken or malicious.",
      inputType: "textarea" as const,
      maxLength: 280,
    },
  };

  const content = modalContent[actionType];

  const handleSubmit = () => {
    // When flagging a duplicate, the URL is now required and must match the pattern.
    if (actionType === "duplicate") {
      // Strip the protocol from the siteUrl for the regex pattern
      const domain = siteUrl.replace(/^https?:\/\//, "");
      // This regex makes the 'http(s)://' part optional.
      const urlPattern = new RegExp(`^(?:https?://)?${domain}/agents/\\d+$`);
      if (!reason.trim() || !urlPattern.test(reason)) {
        toast.error(`A valid agent URL is required (e.g., ${exampleUrl}).`);
        return; // Stop submission if invalid
      }
    }
    onSubmit(reason);
  };

  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      <div className="p-8 space-y-4 w-full min-[500px]:w-[500px]">
        <h2 className="text-2xl font-bold">{content.title}</h2>
        <div>
          <Label htmlFor="reason-input" className="font-semibold text-gray-700">
            {content.label}
          </Label>
          {content.inputType === "textarea" ? (
            <Textarea
              id="reason-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={content.placeholder}
              maxLength={content.maxLength}
              className="mt-2 min-h-[100px]"
            />
          ) : (
            <Input
              id="reason-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={content.placeholder}
              className="mt-2"
            />
          )}
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} disabled={isSubmitting} className={primaryButtonClasses}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};
