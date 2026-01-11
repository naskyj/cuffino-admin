"use client";

import { Check, Copy } from "lucide-react";
import React, { useState } from "react";

import {
  FacebookIcon,
  InstagramIcon,
  SuccessIcon,
  WhatsAppIcon,
  XIcon,
} from "./assets";
import Modal from "./modal";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  className?: string;
  shareUrl?: string;
  shareText?: string;
  showSocialShare?: boolean;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = "Success",
  message = "Operation completed successfully!",
  className = "max-w-md",
  shareUrl = typeof window !== "undefined" ? window.location.href : "",
  shareText = "Check this out!",
  showSocialShare = false,
}) => {
  const [copied, setCopied] = useState(false);

  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    whatsappStatus: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    instagram: "https://www.instagram.com/",
  };

  const handleShare = (platform: string) => {
    const url = shareLinks[platform as keyof typeof shareLinks];
    if (url) {
      window.open(url, "_blank", "width=600,height=400");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton
      closeOnOverlayClick
      closeOnEscape
      className={className}
    >
      <div className="flex flex-col items-center justify-center text-center py-6 px-4">
        <div className="mb-6">
          <SuccessIcon />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">{message}</p>

        {showSocialShare && (
          <div className="w-full mt-4 border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Share your success
            </h3>

            {/* Social Share Buttons */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={() => handleShare("facebook")}
                type="button"
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors"
                aria-label="Share on Facebook"
                title="Share on Facebook"
              >
                <FacebookIcon className="w-6 h-6 text-white" />
              </button>

              <button
                type="button"
                onClick={() => handleShare("twitter")}
                className="w-12 h-12 rounded-full bg-black hover:bg-gray-800 flex items-center justify-center transition-colors"
                aria-label="Share on X (Twitter)"
                title="Share on X (Twitter)"
              >
                <XIcon className="w-6 h-6 text-white" />
              </button>

              <button
                type="button"
                onClick={() => handleShare("whatsapp")}
                className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20BA5A] flex items-center justify-center transition-colors"
                aria-label="Share on WhatsApp"
                title="Share on WhatsApp"
              >
                <WhatsAppIcon className="w-6 h-6 text-white" />
              </button>

              <button
                type="button"
                onClick={() => handleShare("whatsappStatus")}
                className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20BA5A] flex items-center justify-center transition-colors relative"
                aria-label="Share to WhatsApp Status"
                title="Share to WhatsApp Status"
              >
                <WhatsAppIcon className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <span className="text-[10px] text-[#25D366] font-bold">
                    S
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleShare("instagram")}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center justify-center transition-colors"
                aria-label="Share on Instagram"
                title="Share on Instagram"
              >
                <InstagramIcon className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Copy Link Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Link copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy link</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SuccessModal;
