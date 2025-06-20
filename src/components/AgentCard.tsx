import React from "react";
import Image from "next/image";
import type { Agent } from "@prisma/client";
import { Button } from "@/components/ui/button";

type AgentCardProps = {
  agent: Agent;
};

// A helper to format the skill for display
const formatSkill = (skill: string) => {
  return skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  return (
    <div className="relative h-[399px] w-[346px] overflow-hidden rounded-lg shadow-lg">
      {/* Background Image */}
      <Image
        src={agent.avatarUrl}
        alt={`${agent.name}'s avatar`}
        fill
        className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
        priority // Prioritize loading images that are visible on page load
      />

      {/* Semi-transparent Banner at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[124px] bg-white/80 p-4 backdrop-blur-sm">
        <div className="flex h-full flex-col justify-between">
          {/* Row 1: Skill */}
          <div>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
              {formatSkill(agent.skill)}
            </span>
          </div>

          {/* Row 2: Agent Name */}
          <h3 className="text-xl font-bold text-gray-900">{agent.name}</h3>

          {/* Row 3: Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" className="bg-white/50">
              Button 1
            </Button>
            <Button variant="outline" size="sm" className="bg-white/50">
              Button 2
            </Button>
            <Button variant="outline" size="sm" className="bg-white/50">
              Button 3
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
