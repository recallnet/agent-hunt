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
import { AgentFields, NewAgentModalProps } from "../../utils/types";
import { useSWRConfig } from "swr";

// Define types for local form state and errors
type FormState = Omit<AgentFields, "authorAddress" | "skill"> & { skill: string };
type FormErrors = Partial<Record<keyof FormState | "avatar", string>>;

export const NewAgentModal: React.FC<NewAgentModalProps> = ({ isOpen, onClose }) => {
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

  // --- Event Handlers ---

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(URL.createObjectURL(file));
      if (errors.avatar) {
        setErrors((prev) => ({ ...prev, avatar: undefined }));
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const handleSkillChange = (value: string) => {
    setFormData((prev) => ({ ...prev, skill: value }));
    if (errors.skill) {
      setErrors((prev) => ({ ...prev, skill: undefined }));
    }
  };

  // --- Form Validation ---

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Agent name is required.";
    if (!formData.xAccount.trim()) newErrors.xAccount = "X Account is required.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    if (!formData.whyHunt.trim()) newErrors.whyHunt = "This field is required.";
    if (!formData.skill) newErrors.skill = "A skill must be selected.";
    if (!avatarFile) newErrors.avatar = "An avatar image is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Form Submission ---

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to submit.");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fill out all required fields.");
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

      toast.success("Agent submitted successfully!", { id: loadingToast });

      // Refetch the data after the agent that's just been created
      mutate("/api/agents");

      onClose();
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.", { id: loadingToast });
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
