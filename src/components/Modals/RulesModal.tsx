import React from "react";
import { ModalBase } from "./ModalBase";
import { RulesModalProps } from "@utils/types";

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      {/* These classes make the content area scrollable if it exceeds 90% of the viewport height */}
      <div className="p-8 md:p-10 text-gray-800 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-center mb-2">Rules</h2>
        <p className="text-lg text-center text-gray-600 mb-4">Hunt agents, earn fragments</p>
        <p className="text-md text-center text-gray-500 mb-8">
          Help build the world’s largest community-powered catalog of top AI agents.
        </p>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-2">Add new agents</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Add a new agent to the catalog by hunting it</li>
              <li>Provide descriptions and reasons for submission</li>
              <li>Avoid duplicates or spam</li>
              <li>Max 5 hunts per day per user</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">Curate existing agents</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Upvote quality agents, flag duplicates, or mark spam</li>
              <li>Max 10 actions per day per user</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">Earn fragments</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Fragments are retroactively awarded every 2 weeks</li>
              <li>Hunters earn fragments for hunting the most upvoted agents</li>
              <li>Hunters earn fragments for hunting agents that later compete</li>
              <li>Curators earn fragments for curating early and correctly</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">Don’t get banned</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                Users who abuse AgentHunt in any manner may be blocked from the app and banned from the points program.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ModalBase>
  );
};
