"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui";
import { useClickOutside } from "@/hooks";
import { cn } from "@/lib/utils";

export interface ActionOptionProps {
  text: React.ReactNode;
  action: () => void;
  type?: "info" | "warning" | "danger" | "success";
  disabled?: boolean;
}

interface ActionProps {
  options: ActionOptionProps[];
  variant?: "vertical" | "horizontal";
  className?: string;
}

const Action: React.FC<ActionProps> = ({
  options,
  variant = "vertical",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"bottom" | "top">("bottom");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  // Calculate dropdown position based on available space
  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) {
      return;
    }

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Estimate menu height (40px per option + 8px padding)
    const estimatedMenuHeight = options.length * 40 + 16;
    const minSpaceRequired = estimatedMenuHeight + 8; // Add some buffer

    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    // Show on top if not enough space below but enough space above
    // Otherwise show on bottom
    if (spaceBelow < minSpaceRequired && spaceAbove >= minSpaceRequired) {
      setPosition("top");
    } else {
      setPosition("bottom");
    }
  }, [options.length]);

  useEffect(() => {
    if (!isOpen || !buttonRef.current) {
      return undefined;
    }

    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      calculatePosition();
    });

    // Recalculate on scroll and resize
    window.addEventListener("scroll", calculatePosition, true);
    window.addEventListener("resize", calculatePosition);

    return () => {
      window.removeEventListener("scroll", calculatePosition, true);
      window.removeEventListener("resize", calculatePosition);
    };
  }, [isOpen, calculatePosition]);

  const handleOptionClick = (option: ActionOptionProps) => {
    if (!option.disabled) {
      option.action();
      setIsOpen(false);
    }
  };

  const getOptionStyles = (type?: string, disabled?: boolean) => {
    if (disabled) {
      return "text-gray-400 cursor-not-allowed";
    }

    switch (type) {
      case "danger":
        return "text-red-600 hover:bg-red-50";
      case "warning":
        return "text-yellow-600 hover:bg-yellow-50";
      case "success":
        return "text-green-600 hover:bg-green-50";
      case "info":
      default:
        return "text-blue-600 hover:bg-blue-50";
    }
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        aria-label="More options"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {variant === "vertical" ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </Button>

      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            "absolute right-0 w-48 bg-white rounded-md shadow-lg z-[100] border border-gray-200",
            position === "top" ? "bottom-full mb-1" : "top-full mt-1"
          )}
        >
          <div className="py-1">
            {options.map((option, index) => (
              <button
                type="button"
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                onClick={() => handleOptionClick(option)}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm transition-colors",
                  getOptionStyles(option.type, option.disabled)
                )}
                disabled={option.disabled}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Action;
