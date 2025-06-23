import React, { useEffect } from "react";

type ModalBaseProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export const ModalBase: React.FC<ModalBaseProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center backdrop-brightness-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl relative w-full h-full md:h-auto md:w-[778px] md:overflow-y-visible overflow-y-auto md:max-h-[770px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-12 text-2xl text-gray-500 hover:text-gray-800 z-10"
          aria-label="Close modal"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};
