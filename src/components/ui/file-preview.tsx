"use client";

import { FileText, Image, Music, RotateCcw, Video, X } from "lucide-react";
import React, { useState } from "react";

import {
  formatFileSize,
  getFileExtension as getFileExt,
  isAudioUrl,
  isImageUrl,
  isVideoUrl,
} from "@/lib/upload";
import { cn } from "@/lib/utils";

interface FilePreviewProps {
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  onReplace?: (_newFile: File) => Promise<void>;
  onRemove?: () => void;
  className?: string;
  showActions?: boolean;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  fileUrl,
  fileName,
  fileSize,
  fileType,
  onReplace,
  onRemove,
  className,
  showActions = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Determine if this is an image based on URL or fileType
  const isImage = fileType?.startsWith("image/") || isImageUrl(fileUrl);

  // Handle file replacement
  const handleReplace = async () => {
    if (!onReplace) return;

    const input = document.createElement("input");
    input.type = "file";
    input.multiple = false;
    input.accept = ".psd,.jpg,.jpeg,.png,.svg,.mp3,.mp4,.doc,.docx,.pdf";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setIsReplacing(true);
        try {
          await onReplace(file);
        } catch (error) {
          console.error("Error replacing file:", error);
        } finally {
          setIsReplacing(false);
        }
      }
    };

    input.click();
  };

  // Early return if file URL is invalid
  if (!fileUrl) {
    return (
      <div
        className={cn(
          "relative group rounded-lg border-2 border-gray-200 bg-gray-50 p-4",
          className
        )}
      >
        <div className="flex items-center justify-center h-24">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <div className="p-2 bg-white bg-opacity-80">
          <div className="text-xs font-medium text-gray-500">Invalid file</div>
        </div>
      </div>
    );
  }

  const getFileTypeIcon = () => {
    if (isImage) {
      return <Image className="h-8 w-8 text-blue-500" />;
    }
    if (fileType?.startsWith("video/") || isVideoUrl(fileUrl)) {
      return <Video className="h-8 w-8 text-red-500" />;
    }
    if (fileType?.startsWith("audio/") || isAudioUrl(fileUrl)) {
      return <Music className="h-8 w-8 text-green-500" />;
    }
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  const getFileTypeColor = () => {
    if (isImage) {
      return "bg-blue-50 border-blue-200";
    }
    if (fileType?.startsWith("video/") || isVideoUrl(fileUrl)) {
      return "bg-red-50 border-red-200";
    }
    if (fileType?.startsWith("audio/") || isAudioUrl(fileUrl)) {
      return "bg-green-50 border-green-200";
    }
    return "bg-gray-50 border-gray-200";
  };

  const getFileExtension = () => {
    if (fileName) {
      return getFileExt(fileName);
    }
    return getFileExt(fileUrl);
  };

  return (
    <div
      className={cn(
        "relative group rounded-lg border-2 overflow-hidden transition-all duration-200",
        getFileTypeColor(),
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Preview Content */}
      <div className="relative w-full h-24 flex items-center justify-center">
        {isImage && !imageError ? (
          // Show image preview from URL
          <img
            src={fileUrl}
            alt={fileName || "Preview"}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          // Show file type icon and info
          <div className="flex flex-col items-center space-y-1 p-2">
            {getFileTypeIcon()}
            <span className="text-xs font-medium text-gray-600">
              {getFileExtension()}
            </span>
          </div>
        )}

        {/* Loading overlay for replacement */}
        {isReplacing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-sm">Replacing...</div>
          </div>
        )}

        {/* Overlay Actions */}
        {showActions && isHovered && !isReplacing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-2">
            {onReplace && (
              <button
                type="button"
                onClick={handleReplace}
                className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                aria-label="Replace file"
              >
                <RotateCcw className="h-4 w-4 text-gray-700" />
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="p-2 bg-red-500 bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
                aria-label="Remove file"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="p-2 bg-white bg-opacity-80">
        <div className="text-xs font-medium text-gray-800 truncate">
          {fileName || fileUrl.split("/").pop() || "Unknown file"}
        </div>
        {fileSize && (
          <div className="text-xs text-gray-500">
            {formatFileSize(fileSize)}
          </div>
        )}
      </div>
    </div>
  );
};

export { FilePreview };
