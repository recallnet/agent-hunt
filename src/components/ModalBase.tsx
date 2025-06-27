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
    <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-brightness-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl relative w-full max-w-[778px] h-full md:h-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-800 z-10 cursor-pointer"
          aria-label="Close modal"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};
