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
import { FormErrors, AgentFormState, NewAgentModalProps, skills } from "@utils/types";
import { ModalBase } from "./ModalBase";
import { primaryButtonClasses } from "@components/ui/styles";

// A list of available sample avatars from your /public directory
const sampleAvatars = ["/avatar-samples/avatar1.png", "/avatar-samples/avatar2.png", "/avatar-samples/avatar3.png"];

export const NewAgentModal: React.FC<NewAgentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { address, isConnected } = useAccount();
  const { mutate } = useSWRConfig();
  const [formData, setFormData] = useState<AgentFormState>({
    name: "",
    url: "",
    description: "",
    whyHunt: "",
    skill: "",
    otherSkill: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [fallbackAvatar, setFallbackAvatar] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB

  useEffect(() => {
    if (!isOpen) {
      // Reset all state when modal closes
      setFormData({ name: "", url: "", description: "", whyHunt: "", skill: "", otherSkill: "" });
      setAvatarFile(null);
      setAvatarPreview(null);
      setFallbackAvatar(null);
      setErrors({});
      setIsSubmitting(false);
    } else {
      // Pre-select a random avatar when modal opens
      const randomIndex = Math.floor(Math.random() * sampleAvatars.length);
      setFallbackAvatar(sampleAvatars[randomIndex]);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const validateField = (field: keyof AgentFormState, value: string): string | undefined => {
    switch (field) {
      case "name":
        return value.trim() ? undefined : "Agent name is required.";
      case "url":
        if (!value.trim()) return "URL is required.";
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        return urlPattern.test(value) ? undefined : "Please enter a valid URL.";
      case "description":
        return value.trim() ? undefined : "Description is required.";
      case "whyHunt":
        return value.trim() ? undefined : "This field is required.";
      case "skill":
        return value ? undefined : "A skill must be selected.";
      case "otherSkill":
        return value.trim() ? undefined : "Please specify the skill.";
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      name: validateField("name", formData.name),
      url: validateField("url", formData.url),
      description: validateField("description", formData.description),
      whyHunt: validateField("whyHunt", formData.whyHunt),
      skill: validateField("skill", formData.skill),
    };

    if (formData.skill === "OTHER") {
      newErrors.otherSkill = validateField("otherSkill", formData.otherSkill);
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_FILE_SIZE) {
        setErrors((prev) => ({ ...prev, avatar: "File size must be less than 3 MB." }));
        toast.error("File size must be less than 3 MB.");
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
    const error = validateField(id as keyof AgentFormState, value);
    setErrors((prev) => ({ ...prev, [id]: error }));
  };

  const handleSkillChange = (value: string) => {
    setFormData((prev) => ({ ...prev, skill: value as AgentFormState["skill"] }));
    const error = validateField("skill", value);
    setErrors((prev) => ({ ...prev, skill: error, otherSkill: undefined })); // Clear otherSkill error on change
  };

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet to submit.");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fill out all required fields correctly.");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Submitting your agent...");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("url", formData.url);
    data.append("description", formData.description);
    data.append("whyHunt", formData.whyHunt);
    data.append("skill", formData.skill);
    if (formData.skill === "OTHER") {
      data.append("otherSkillDetail", formData.otherSkill);
    }
    if (avatarFile) {
      data.append("avatar", avatarFile);
    } else if (fallbackAvatar) {
      data.append("fallbackAvatarPath", fallbackAvatar);
    }
    data.append("authorAddress", address);

    try {
      const response = await fetch("/api/agents", { method: "POST", body: data });
      if (!response.ok) {
        throw new Error((await response.json()).error || "Submission failed.");
      }
      const agent: Agent = await response.json();
      toast.success("Agent submitted successfully!", { id: loadingToast });
      mutate("/api/agents?sortBy=new");
      mutate("/api/agents?sortBy=top");
      onSuccess({
        id: agent.id,
        name: agent.name,
        url: agent.url,
        description: agent.description,
        whyHunt: agent.whyHunt,
        skill: agent.skill,
        otherSkill: formData.otherSkill,
      });
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelStyle = "text-base font-bold";
  const requiredIndicator = <span className="text-red-500 ml-1">*</span>;
  const getErrorStyle = (field: keyof FormErrors) => (errors[field] ? "border-red-500" : "border-[var(--brand-gray)]");
  const inputStyle = `bg-[var(--brand-gray)] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0`;

  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      <div className="p-10 md:p-12 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold tracking-tighter mb-8 text-center md:text-left md:ml-[228px]">
          Add an Agent
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-[204px_1fr] gap-x-6 gap-y-6">
          {/* Column 1: Avatar and Skill */}
          <div className="space-y-6">
            <div>
              <Label className={labelStyle}>Avatar</Label>
              <Input id="avatarUpload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <Label htmlFor="avatarUpload">
                <div
                  className={`relative overflow-hidden mt-2 flex justify-center items-center w-full h-[201px] rounded-[5px] cursor-pointer p-4`}
                  style={!avatarPreview ? { background: "#B5B5B5E5" } : {}}
                >
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="Avatar Preview" fill sizes="204px" className="object-cover" />
                  ) : fallbackAvatar ? (
                    <Image src={fallbackAvatar} alt="Sample Avatar" fill sizes="204px" className="object-contain" />
                  ) : null}
                </div>
              </Label>
              <div className="text-sm text-gray-500 mt-2 text-center">
                <p>Max size 3mb</p>
                <p>Square Image preferred</p>
              </div>
            </div>
            <div>
              <Label htmlFor="skill" className={labelStyle}>
                Skill {requiredIndicator}
              </Label>
              <Select value={formData.skill} onValueChange={handleSkillChange}>
                <SelectTrigger
                  id="skill"
                  className={`${inputStyle} ${getErrorStyle("skill")} w-full mt-2 !h-[51px] flex items-center`}
                >
                  <SelectValue placeholder="Select a skill" />
                </SelectTrigger>
                <SelectContent>
                  {/* Map over the skills array to generate dropdown items */}
                  {skills.map((skill) => (
                    <SelectItem key={skill.value} value={skill.value}>
                      {skill.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conditionally rendered input for "Other" skill */}
            {formData.skill === "OTHER" && (
              <div className="space-y-2">
                <Label htmlFor="otherSkill" className={labelStyle}>
                  Please Specify {requiredIndicator}
                </Label>
                <Input
                  id="otherSkill"
                  value={formData.otherSkill}
                  onChange={handleInputChange}
                  placeholder="e.g. Data Analysis"
                  className={`${inputStyle} ${getErrorStyle("otherSkill")} h-[51px]`}
                />
              </div>
            )}
          </div>

          {/* Column 2: Name, URL, Descriptions, and Button */}
          <div className="space-y-6 flex flex-col">
            <div>
              <Label htmlFor="name" className={labelStyle}>
                Agent Name {requiredIndicator}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Excaliburrr"
                className={`${inputStyle} ${getErrorStyle("name")} mt-2 h-[51px]`}
              />
            </div>
            <div>
              <Label htmlFor="url" className={labelStyle}>
                URL {requiredIndicator}
              </Label>
              <Input
                id="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="e.g. X Account, Website, GitHub"
                className={`${inputStyle} ${getErrorStyle("url")} mt-2 h-[51px]`}
              />
            </div>
            <div>
              <Label htmlFor="description" className={labelStyle}>
                Description {requiredIndicator}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Excaliburrr is an automated cross-chain crypto trading agent..."
                className={`${inputStyle} ${getErrorStyle("description")} mt-2 h-24`}
              />
            </div>
            <div>
              <Label htmlFor="whyHunt" className={labelStyle}>
                Why did you hunt this agent? {requiredIndicator}
              </Label>
              <Textarea
                id="whyHunt"
                value={formData.whyHunt}
                onChange={handleInputChange}
                placeholder="I’ve been using Excaliburrr for 6 months now..."
                className={`${inputStyle} ${getErrorStyle("whyHunt")} mt-2 h-32`}
              />
            </div>
            <div>
              <Button onClick={handleSubmit} disabled={isSubmitting} className={primaryButtonClasses}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ModalBase>
  );
};
