"use client";

import React, { useEffect } from "react";

type NewAgentModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const NewAgentModal: React.FC<NewAgentModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    // This effect prevents the body from scrolling when the modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // Cleanup function to restore scrolling when the component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // The overlay uses `backdrop-brightness-50` to dim the background content.
    <div
      className="fixed inset-0 z-50 flex justify-center items-center backdrop-brightness-30"
      onClick={onClose} // Close modal on overlay click
    >
      <div
        className="bg-white p-8 rounded-lg shadow-xl relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()} // Prevent modal content click from closing the modal
      >
        <h2 className="text-2xl font-bold mb-4">Create New Hunt</h2>
        <p>Modal content will go here.</p>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-gray-800"
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>
    </div>
  );
};
