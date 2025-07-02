import React, { useState } from "react";
import { ActionButtons } from "./ActionButtons";
import { AgentCardProps, skills } from "@utils/types";
import Image from "next/image";
import { AgentParent } from "./AgentParent";
import { ModalBase } from "@/components/Modals/ModalBase";
import { formatSkill } from "@utils/helper-functions";

export const AgentCard: React.FC<AgentCardProps> = ({ agent, actionProps, mutateList }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const skillLabel = skills.find((s) => s.value === agent.skill)?.label || formatSkill(agent.skill);

  return (
    <>
      <div
        className="relative h-[399px] w-full overflow-hidden group transition-all duration-300 hover:shadow-glow cursor-pointer"
        onClick={() => setModalOpen(true)}
      >
        <div className="relative w-full h-full bg-gray-200"> {/* Added grey background */}
          <Image
            src={agent.avatarUrl}
            alt={`${agent.name}'s avatar`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
            priority
          />
        </div>
        {/* White box underneath */}
        <div className="absolute bottom-0 left-0 right-0 h-[124px] bg-white/90 p-4 ">
          <div className="flex h-full flex-col justify-between gap-1">
            <div>
              <span className="text-base font-small font-bold text-gray-500">{skillLabel}</span>
            </div>
            <div className="-mt-4">
              <h3 className="text-2xl text-gray-900 truncate">{agent.name}</h3>
            </div>
            <ActionButtons {...actionProps} />
          </div>
        </div>
      </div>

      <ModalBase isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <AgentParent agent={agent} cardView={false} mutateList={mutateList} />
      </ModalBase>
    </>
  );
};