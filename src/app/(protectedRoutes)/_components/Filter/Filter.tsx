"use client";

import { X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { useClickOutside } from "@/hooks";
import { cn } from "@/lib/utils";

export interface FilterOptionProps {
  title: string;
  action: () => void;
  disabled?: boolean;
}

interface FilterProps {
  dropdownContent: FilterOptionProps[];
  filterText?: string;
  className?: string;
  buttonClassName?: string;
}

const Filter: React.FC<FilterProps> = ({
  dropdownContent,
  filterText = "All",
  className,
  buttonClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<"bottom" | "top">("bottom");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedOption, setSelectedOption] =
    useState<FilterOptionProps | null>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  // Calculate dropdown position based on available space
  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Estimate menu height (40px per option + 8px padding)
    const estimatedMenuHeight = dropdownContent.length * 40 + 16;
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
  }, [dropdownContent.length]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => calculatePosition());

      // Recalculate on scroll and resize
      window.addEventListener("scroll", calculatePosition, true);
      window.addEventListener("resize", calculatePosition);

      return () => {
        window.removeEventListener("scroll", calculatePosition, true);
        window.removeEventListener("resize", calculatePosition);
      };
    }
    return undefined;
  }, [isOpen, calculatePosition]);

  const handleOptionClick = (option: FilterOptionProps) => {
    if (!option.disabled) {
      setSelectedOption(option);
      option.action();
      setIsOpen(false);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOption(null);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-black hover:bg-gray-50 transition-colors",
          buttonClassName
        )}
        aria-label="Filter options"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        {selectedOption ? selectedOption.title : filterText}
        {selectedOption && (
          <span
            onClick={handleReset}
            className="ml-auto p-0.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
            aria-label="Reset filter"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleReset(e as unknown as React.MouseEvent);
              }
            }}
          >
            <X className="w-4 h-4" />
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            "absolute right-0 w-48 bg-white rounded-md shadow-lg z-[100] border border-gray-200",
            position === "top" ? "bottom-full mb-1" : "top-full mt-1"
          )}
        >
          <div className="py-1">
            {dropdownContent.map((option, index) => (
              <React.Fragment key={option.title}>
                <button
                  type="button"
                  onClick={() => handleOptionClick(option)}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors",
                    option.disabled && "text-gray-400 cursor-not-allowed"
                  )}
                  disabled={option.disabled}
                >
                  {option.title}
                </button>
                {index < dropdownContent.length - 1 && (
                  <div className="border-t border-gray-200" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filter;
