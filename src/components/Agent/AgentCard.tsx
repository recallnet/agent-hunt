import React, { useState } from "react";
import { ActionButtons } from "./ActionButtons";
import { AgentCardProps } from "@utils/types";
import Image from "next/image";
import { AgentParent } from "./AgentParent";
import { ModalBase } from "@/components/Modals/ModalBase";
import { formatSkill } from "@utils/helper-functions";

export const AgentCard: React.FC<AgentCardProps> = ({ agent, actionProps }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="relative h-[399px] w-full overflow-hidden group transition-all duration-300 hover:shadow-glow ring-1 ring-gray-200">
        <div className="relative w-full h-full cursor-pointer" onClick={() => setModalOpen(true)}>
          <Image
            src={agent.avatarUrl}
            alt={`${agent.name}'s avatar`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            priority
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[124px] bg-white/90 p-4 rounded-t-2xl">
          <div className="flex h-full flex-col justify-between gap-1">
            <div>
              <span className="text-base font-small">{formatSkill(agent.skill)}</span>
            </div>
            <div className="-mt-4">
              <h3 className="text-2xl font-bold text-gray-900 truncate">{agent.name}</h3>
            </div>
            <ActionButtons {...actionProps} />
          </div>
        </div>
      </div>

      <ModalBase isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <AgentParent agent={agent} cardView={false} />
      </ModalBase>
    </>
  );
};
