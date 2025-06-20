"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type NewAgentModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const NewAgentModal: React.FC<NewAgentModalProps> = ({ isOpen, onClose }) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // Cleanup the object URL to prevent memory leaks
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      document.body.style.overflow = "auto";
    };
  }, [isOpen, avatarPreview]);

  if (!isOpen) return null;

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Revoke the old object URL if one exists
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const labelStyle = "text-base font-bold";
  const inputStyle =
    "border-[var(--brand-gray)] bg-[var(--brand-gray)] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0";

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-brightness-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl relative w-full h-full md:h-auto md:w-[778px] md:overflow-y-visible overflow-y-auto md:max-h-[780px]"
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
            <div className="md:col-start-2 md:row-start-1 mb-6 md:mb-0">
              <Label htmlFor="agentName" className={labelStyle}>
                Agent Name
              </Label>
              <Input id="agentName" placeholder="Excaliburrr" className={`${inputStyle} mt-2 h-[51px]`} />
            </div>

            {/* --- Avatar (Mobile Order: 2) --- */}
            <div className="md:col-start-1 md:row-start-1 mb-6">
              <Label className={labelStyle}>Avatar</Label>
              <Input id="avatarUpload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <Label htmlFor="avatarUpload">
                <div className="relative overflow-hidden mt-2 flex justify-center items-center w-full h-[201px] bg-[var(--brand-gray)] rounded-[5px] cursor-pointer">
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
              <Select>
                <SelectTrigger id="skill" className={`${inputStyle} w-full mt-2 !h-[51px] flex items-center`}>
                  <SelectValue placeholder="Select a skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trading">Trading</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="automation">Automation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* --- X Account (Mobile Order: 4) --- */}
            <div className="md:col-start-2 md:row-start-2 mb-6 md:relative md:-top-[150px]">
              <Label htmlFor="xAccount" className={labelStyle}>
                X Account
              </Label>
              <Input id="xAccount" placeholder="https://x.com/excaliburrr" className={`${inputStyle} mt-2 h-[51px]`} />
            </div>

            {/* --- Description (Mobile Order: 5) --- */}
            <div className="md:col-start-2 md:row-start-3 mb-6 md:relative md:-top-[150px]">
              <Label htmlFor="description" className={labelStyle}>
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Excaliburrr is an automated cross-chain crypto trading agent that specializes in tokens that have upside."
                className={`${inputStyle} mt-2 h-24`}
              />
            </div>

            {/* --- Why Hunt (Mobile Order: 6) --- */}
            <div className="md:col-start-2 md:row-start-4 mb-6 md:relative md:-top-[150px]">
              <Label htmlFor="whyHunt" className={labelStyle}>
                Why did you hunt this agent?
              </Label>
              <Textarea
                id="whyHunt"
                placeholder="I’ve been using Excaliburrr for 6 months now to manage my portfolio. Over that time it has generated 50% profit and never had a down month, despite lots of market volatility."
                className={`${inputStyle} mt-2 h-32`}
              />
            </div>

            {/* --- Submit Button (Mobile Order: 7) --- */}
            <div className="md:col-start-2 md:row-start-5 md:relative md:-top-[150px]">
              <Button className="w-[184px] h-[37px] rounded-[5px] cursor-pointer bg-[var(--brand-blue)] hover:bg-[var(--brand-blue-hover)] text-white text-lg">
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
