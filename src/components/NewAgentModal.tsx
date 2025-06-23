"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { useSWRConfig } from "swr";
import type { Agent } from "@prisma/client";
import { FormErrors, FormState, NewAgentModalProps } from "../../utils/types";

// Define types for local form state and errors

export const NewAgentModal: React.FC<NewAgentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { address, isConnected } = useAccount();
  const { mutate } = useSWRConfig();

  // State for form data, files, errors, and submission status
  const [formData, setFormData] = useState<FormState>({
    name: "",
    xAccount: "",
    description: "",
    whyHunt: "",
    skill: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Constant for max file size (1 MB in bytes)
  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

  // Effect to reset the form state when the modal is closed
  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: "", xAccount: "", description: "", whyHunt: "", skill: "" });
      setAvatarFile(null);
      setAvatarPreview(null);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Effect to manage body overflow and cleanup object URLs
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      document.body.style.overflow = "auto";
    };
  }, [isOpen, avatarPreview]);

  if (!isOpen) return null;

  // --- Validation Functions ---

  const validateField = (field: keyof FormState, value: string): string | undefined => {
    switch (field) {
      case "name":
        return value.trim() ? undefined : "Agent name is required.";
      case "xAccount":
        if (!value.trim()) return "X Account is required.";
        const xAccountPattern = /^(https?:\/\/)?x\.com\/.+$/;
        return xAccountPattern.test(value)
          ? undefined
          : "X Account must be in the format 'https://x.com/username' or 'x.com/username'.";
      case "description":
        return value.trim() ? undefined : "Description is required.";
      case "whyHunt":
        return value.trim() ? undefined : "This field is required.";
      case "skill":
        return value ? undefined : "A skill must be selected.";
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: validateField("name", formData.name),
      xAccount: validateField("xAccount", formData.xAccount),
      description: validateField("description", formData.description),
      whyHunt: validateField("whyHunt", formData.whyHunt),
      skill: validateField("skill", formData.skill),
      avatar: avatarFile ? undefined : "An avatar image is required.",
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  // --- Event Handlers ---

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setErrors((prev) => ({ ...prev, avatar: "File size must be less than 1 MB." }));
        toast.error("File size must be less than 1 MB.");
        return;
      }
      setAvatarFile(file);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, avatar: undefined }));
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Validate the changed field immediately
    const error = validateField(id as keyof FormState, value);
    setErrors((prev) => ({ ...prev, [id]: error }));
  };

  const handleSkillChange = (value: string) => {
    setFormData((prev) => ({ ...prev, skill: value }));
    // Validate skill immediately
    const error = validateField("skill", value);
    setErrors((prev) => ({ ...prev, skill: error }));
  };

  // --- Form Submission ---

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to submit.");
      return;
    }

    // Validate form and get errors
    const isValid = validateForm();
    if (!isValid) {
      if (errors.xAccount) {
        toast.error(errors.xAccount);
      } else {
        toast.error("Please fill out all required fields.");
      }
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Submitting your agent...");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("xAccount", formData.xAccount);
    data.append("description", formData.description);
    data.append("whyHunt", formData.whyHunt);
    data.append("skill", formData.skill);
    data.append("avatar", avatarFile!);
    data.append("authorAddress", address);

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Submission failed.");
      }

      const agent: Agent = await response.json();
      toast.success("Agent submitted successfully!", { id: loadingToast });
      mutate("/api/agents");
      onSuccess({
        id: agent.id,
        name: agent.name,
        xAccount: agent.xAccount,
        description: agent.description,
        whyHunt: agent.whyHunt,
        skill: agent.skill,
        agentHandle: agent.xAccount.split("/").pop() || agent.name,
      });
      onClose();
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Styles ---

  const labelStyle = "text-base font-bold";
  const getErrorStyle = (field: keyof FormErrors) => (errors[field] ? "border-red-500" : "border-[var(--brand-gray)]");
  const inputStyle = `bg-[var(--brand-gray)] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0`;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-brightness-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl relative w-full h-full md:h-auto md:w-[778px] md:overflow-y-visible overflow-y-auto md:max-h-[770px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-10 md:p-12">
          <button
            onClick={onClose}
            className="absolute top-4 right-12 text-2xl text-gray-500 hover:text-gray-800 z-10"
            aria-label="Close modal"
          >
            ×
          </button>

          <h2 className="text-2xl font-bold tracking-tighter mb-8 md:ml-[250px]">Add an Agent</h2>

          <div className="grid grid-cols-1 md:grid-cols-[204px_1fr] md:gap-x-6">
            {/* --- Agent Name (Mobile Order: 1) --- */}
            <div className="md:col-start-2 md:row-start-1 mb-6 md:mb-0 relative">
              <Label htmlFor="name" className={labelStyle}>
                Agent Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Excaliburrr"
                className={`${inputStyle} ${getErrorStyle("name")} mt-2 h-[51px]`}
              />
            </div>

            {/* --- Avatar (Mobile Order: 2) --- */}
            <div className="md:col-start-1 md:row-start-1 mb-6">
              <Label className={labelStyle}>Avatar</Label>
              <Input id="avatarUpload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <Label htmlFor="avatarUpload">
                <div
                  className={`relative overflow-hidden mt-2 flex justify-center items-center w-full h-[201px] bg-[var(--brand-gray)] rounded-[5px] cursor-pointer ${
                    errors.avatar ? "border-2 border-solid border-red-500" : ""
                  }`}
                >
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="Avatar Preview" fill className="object-cover" />
                  ) : (
                    <Image src="/avatar-icon.svg" alt="Avatar Icon" width={88} height={100} />
                  )}
                </div>
              </Label>
            </div>

            {/* --- Skill (Mobile Order: 3) --- */}
            <div className="md:col-start-1 md:row-start-2 mb-6">
              <Label htmlFor="skill" className={labelStyle}>
                Skill
              </Label>
              <Select value={formData.skill} onValueChange={handleSkillChange}>
                <SelectTrigger
                  id="skill"
                  className={`${inputStyle} ${getErrorStyle("skill")} w-full mt-2 !h-[51px] flex items-center`}
                >
                  <SelectValue placeholder="Select a skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRADING">Trading</SelectItem>
                  <SelectItem value="RESEARCH">Research</SelectItem>
                  <SelectItem value="AUTOMATION">Automation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* --- X Account (Mobile Order: 4) --- */}
            <div className="md:col-start-2 md:row-start-2 mb-6 md:relative md:-top-[150px]">
              <Label htmlFor="xAccount" className={labelStyle}>
                X Account
              </Label>
              <Input
                id="xAccount"
                value={formData.xAccount}
                onChange={handleInputChange}
                placeholder="https://x.com/excaliburrr"
                className={`${inputStyle} ${getErrorStyle("xAccount")} mt-2 h-[51px]`}
              />
            </div>

            {/* --- Description (Mobile Order: 5) --- */}
            <div className="md:col-start-2 md:row-start-3 mb-6 md:relative md:-top-[150px]">
              <Label htmlFor="description" className={labelStyle}>
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Excaliburrr is an automated cross-chain crypto trading agent..."
                className={`${inputStyle} ${getErrorStyle("description")} mt-2 h-24`}
              />
            </div>

            {/* --- Why Hunt (Mobile Order: 6) --- */}
            <div className="md:col-start-2 md:row-start-4 mb-6 md:relative md:-top-[150px]">
              <Label htmlFor="whyHunt" className={labelStyle}>
                Why did you hunt this agent?
              </Label>
              <Textarea
                id="whyHunt"
                value={formData.whyHunt}
                onChange={handleInputChange}
                placeholder="I’ve been using Excaliburrr for 6 months now..."
                className={`${inputStyle} ${getErrorStyle("whyHunt")} mt-2 h-32`}
              />
            </div>

            {/* --- Submit Button (Mobile Order: 7) --- */}
            <div className="md:col-start-2 md:row-start-5 md:relative md:-top-[150px]">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-[184px] h-[37px] rounded-[5px] cursor-pointer bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-hover)] text-white text-lg disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
