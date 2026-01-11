"use client";

import { Image as ImageIcon, X } from "lucide-react";
import React, { useState } from "react";
import {
  Control,
  FieldPath,
  FieldValues,
  useController,
} from "react-hook-form";

import { cn } from "@/lib/utils";

interface ImageInputProps<T extends FieldValues = FieldValues>
  extends Omit<React.ComponentProps<"input">, "name" | "type"> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
  maxSize?: number; // in MB
  onImageChange?: (_file: File | null) => void;
}

const ImageInput = <T extends FieldValues = FieldValues>({
  name,
  control,
  label,
  className,
  wrapperClassName,
  maxSize: _maxSize = 20, // Legacy prop - no longer used for validation
  onImageChange,
  ...props
}: ImageInputProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const inputId = `image-input-${name}`;

  // Generate preview when file changes
  React.useEffect(() => {
    const { value } = field;
    if (value) {
      // Check if it's a File object
      if (
        typeof value === "object" &&
        value !== null &&
        "name" in value &&
        "size" in value &&
        "type" in value &&
        typeof (value as File).arrayBuffer === "function"
      ) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === "string") {
            setPreview(result);
          }
        };
        reader.readAsDataURL(value as File);
      }
      // Check if it's a URL string
      else if (typeof value === "string") {
        const stringValue = String(value).trim();
        if (stringValue !== "") {
          setPreview(stringValue);
        } else {
          setPreview(null);
        }
      } else {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
  }, [field]);

  const validateImage = (
    file: File
  ): { isValid: boolean; errorMessage?: string } => {
    // Only check if file is empty - no type or size restrictions
    if (file.size === 0) {
      return {
        isValid: false,
        errorMessage: "File appears to be empty. Please select a valid file.",
      };
    }

    return { isValid: true };
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      field.onChange(null);
      setPreview(null);
      onImageChange?.(null);
      return;
    }

    const validation = validateImage(file);
    if (!validation.isValid) {
      // You could set an error state here or use a toast notification
      return;
    }

    setIsUploading(true);
    field.onChange(file);
    onImageChange?.(file);

    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemove = () => {
    field.onChange(null);
    setPreview(null);
    onImageChange?.(null);
  };

  return (
    <div className={cn("w-full", wrapperClassName)}>
      {label && (
        <label
          className="text-sm font-medium whitespace-nowrap leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block"
          htmlFor={inputId}
        >
          {label}
        </label>
      )}

      {preview ? (
        // Show preview when image is selected
        <div className={cn("relative", wrapperClassName)}>
          <div
            className={cn(
              "relative w-full h-[105px] rounded-lg border border-gray-200 overflow-hidden",
              wrapperClassName
            )}
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-sm">Uploading...</div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        // Show upload area when no image is selected
        <div
          className={cn(
            "relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer",
            dragOver && "border-blue-400 bg-blue-50",
            error && "border-red-300",
            className
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="button"
          tabIndex={0}
          aria-label="Upload image"
          onClick={() => document.getElementById(inputId)?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              document.getElementById(inputId)?.click();
            }
          }}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-gray-100 rounded-full">
              <ImageIcon className="h-6 w-6 text-gray-400" />
            </div>
          </div>

          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/psd"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            {...props}
          />
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

ImageInput.displayName = "ImageInput";

export { ImageInput };
