"use client";

import React from "react";

import { FailedIcon } from "./assets";
import { Button } from "./button";
import Modal from "./modal";

interface FailedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTryAgain?: () => void;
  title?: string;
  message?: string;
  className?: string;
}

const FailedModal: React.FC<FailedModalProps> = ({
  isOpen,
  onClose,
  onTryAgain,
  title = "Failed!!!",
  message = "Oops! Something went wrong. Please try again.",
  className = "max-w-sm",
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    showCloseButton
    closeOnOverlayClick
    closeOnEscape
    className={className}
  >
    <div className="flex flex-col items-center justify-center text-center py-8 px-4">
      <div className="mb-6">
        <FailedIcon />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-600 mb-6">{message}</p>
      {onTryAgain && (
        <Button
          onClick={onTryAgain}
          className="w-full bg-gradient-to-r from-[#8B62DE] to-[#7B52CE] hover:from-[#7B52CE] hover:to-[#6B42BE] text-white font-medium py-3 rounded-lg transition-all duration-200"
        >
          Try Again
        </Button>
      )}
    </div>
  </Modal>
);

export default FailedModal;
