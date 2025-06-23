import React from "react";
import { ModalBase } from "./ModalBase";

type RulesModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  return (
    <ModalBase isOpen={isOpen} onClose={onClose}>
      <div className="p-8 md:p-10">
        <h2 className="text-2xl font-bold text-center mb-6">AgentHunt Rules</h2>
        <ul className="list-disc list-inside space-y-4 text-gray-700">
          <li>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante
            dapibus diam.
          </li>
          <li>
            Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus
            sed augue semper porta.
          </li>
          <li>
            Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per
            conubia nostra, per inceptos himenaeos.
          </li>
          <li>
            Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean
            quam. In scelerisque sem at dolor.
          </li>
          <li>
            Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus
            risus, iaculis vel, suscipit quis, luctus non, massa.
          </li>
        </ul>
      </div>
    </ModalBase>
  );
};
