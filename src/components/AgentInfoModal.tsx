import React from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { ModalBase } from "./ModalBase";
import { EnhancedAgent } from "@utils/types";

type AgentInfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  agent: EnhancedAgent;
};

const InfoField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <Label className="text-base font-bold">{label}</Label>
    <div className="mt-2 text-gray-800 text-base">{children}</div>
  </div>
);

export const AgentInfoModal: React.FC<AgentInfoModalProps> = ({ isOpen, onClose, agent }) => {
  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      <div className="p-10 md:p-12">
        <h2 className="text-2xl font-bold tracking-tighter mb-8 md:ml-[250px]">Agent Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-[204px_1fr] md:gap-x-6">
          <div className="md:col-start-2 md:row-start-1 mb-6 md:mb-0 relative">
            <InfoField label="Agent Name">{agent.name}</InfoField>
          </div>
          <div className="md:col-start-1 md:row-start-1 mb-6">
            <Label className="text-base font-bold">Avatar</Label>
            <div className="relative overflow-hidden mt-2 w-full h-[201px] rounded-[5px]">
              <Image src={agent.avatarUrl} alt={`${agent.name}'s avatar`} fill className="object-cover" />
            </div>
          </div>
          <div className="md:col-start-1 md:row-start-2 mb-6">
            <InfoField label="Skill">
              <span className="capitalize">{agent.skill.toLowerCase()}</span>
            </InfoField>
          </div>
          <div className="md:col-start-2 md:row-start-2 mb-6 md:relative md:-top-[150px]">
            <InfoField label="X Account">
              <a
                href={agent.xAccount}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {agent.xAccount}
              </a>
            </InfoField>
          </div>
          <div className="md:col-start-2 md:row-start-3 mb-6 md:relative md:-top-[150px]">
            <InfoField label="Description">
              <p className="whitespace-pre-wrap">{agent.description}</p>
            </InfoField>
          </div>
          <div className="md:col-start-2 md:row-start-4 mb-6 md:relative md:-top-[150px]">
            <InfoField label="Why did you hunt this agent?">
              <p className="whitespace-pre-wrap">{agent.whyHunt}</p>
            </InfoField>
          </div>
        </div>
      </div>
    </ModalBase>
  );
};
