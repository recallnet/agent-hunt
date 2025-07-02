import { ModalBaseProps } from "@utils/types";
import React, { useEffect } from "react";

export const ModalBase: React.FC<ModalBaseProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    // This effect exclusively handles the body's scroll and padding.
    if (isOpen) {
      // Get the original body overflow style
      const originalOverflow = window.getComputedStyle(document.body).overflow;
      // Calculate scrollbar width only if the body is actually scrollable
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      // Return a cleanup function to restore the original state
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = "0";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // The overlay to capture clicks for closing the modal
    <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-brightness-50 p-4" onClick={onClose}>
      {/* This relative container holds both the modal and the button,
          allowing the button to be positioned correctly relative to the modal. */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-[778px] h-full md:h-auto">
          {/* Modal content is rendered here */}
          {children}
        </div>

        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-2 right-6 text-4xl font-sans font-light text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
        >
          ×
        </button>
      </div>
    </div>
  );
};
