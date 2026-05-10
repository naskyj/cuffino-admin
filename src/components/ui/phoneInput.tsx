import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { countryCodeOptions } from "@/utilities/helpers";

interface PhoneInputProps {
  label?: string;
  value?: {
    prefix: string;
    number: string;
  };
  onChange?: (_value: { prefix: string; number: string }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  id?: string;
}

const PhoneInput = React.forwardRef<HTMLDivElement, PhoneInputProps>(
  (
    {
      label,
      value = { prefix: "+234", number: "" },
      onChange,
      placeholder = "(555) 000-0000",
      className,
      disabled = false,
      error,
      id,
      ...props
    },
    ref
  ) => {
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [selectedPrefix, setSelectedPrefix] = React.useState(value.prefix);
    const [phoneNumber, setPhoneNumber] = React.useState(value.number);
    const [dropdownDirection, setDropdownDirection] = React.useState<
      "up" | "down"
    >("down");
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const selectedCountry = countryCodeOptions.find(
      (option) => option.value === selectedPrefix
    );

    const calculateDropdownDirection = () => {
      if (!dropdownRef.current) return "down";

      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 240; // Approximate height of dropdown with max-h-60

      // If there's not enough space below, open upward
      if (
        rect.bottom + dropdownHeight > viewportHeight &&
        rect.top > dropdownHeight
      ) {
        return "up";
      }

      return "down";
    };

    const handleDropdownToggle = () => {
      if (disabled) return;

      if (!isDropdownOpen) {
        // Calculate direction before opening
        const direction = calculateDropdownDirection();
        setDropdownDirection(direction);
      }

      setIsDropdownOpen(!isDropdownOpen);
    };

    const handlePrefixChange = (prefix: string) => {
      setSelectedPrefix(prefix);
      setIsDropdownOpen(false);
      onChange?.({ prefix, number: phoneNumber });
    };

    const handlePhoneNumberChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const inputValue = e.target.value;
      setPhoneNumber(inputValue);
      onChange?.({ prefix: selectedPrefix, number: inputValue });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    React.useEffect(() => {
      setSelectedPrefix(value.prefix);
      setPhoneNumber(value.number);
    }, [value.prefix, value.number]);

    // Recalculate dropdown direction on window resize
    React.useEffect(() => {
      const handleResize = () => {
        if (isDropdownOpen) {
          const direction = calculateDropdownDirection();
          setDropdownDirection(direction);
        }
      };

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, [isDropdownOpen]);

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {label && (
          <label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block"
            htmlFor={id}
          >
            {label}
          </label>
        )}

        <div
          ref={dropdownRef}
          className={cn(
            "relative flex h-10 w-full rounded-md border border-input bg-background ring-offset-background focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-1",
            error && "border-red-500 focus-within:ring-red-500"
          )}
        >
          {/* Country Code Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={handleDropdownToggle}
              disabled={disabled}
              className={cn(
                "flex h-full items-center justify-between gap-2 px-3 py-2 md:text-sm text-xs whitespace-nowrap border-r border-input bg-muted/50 hover:bg-muted/70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-l-md transition-colors",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <span className="text-foreground font-medium">
                {selectedCountry?.label || "Select Country"}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  isDropdownOpen && "rotate-180"
                )}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className={cn(
                  "absolute left-0 z-50 w-full min-w-[200px] rounded-md border border-input bg-popover shadow-md",
                  dropdownDirection === "down"
                    ? "top-full mt-1"
                    : "bottom-full mb-1"
                )}
              >
                <div className="max-h-60 overflow-auto p-1">
                  {countryCodeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handlePrefixChange(option.value)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-sm px-3 py-2 md:text-sm text-xs hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none transition-colors",
                        selectedPrefix === option.value &&
                          "bg-accent text-accent-foreground"
                      )}
                    >
                      <span>{option.label}</span>
                      {selectedPrefix === option.value && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Phone Number Input */}
          <input
            type="tel"
            id={id}
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "flex-1 h-full rounded-r-md border-0 bg-transparent px-3 py-2 md:text-sm text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            )}
          />
        </div>

        {/* Error Message */}
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

        {/* Click outside to close dropdown */}
        {isDropdownOpen && (
          <div
            className="fixed inset-0 z-40"
            role="button"
            tabIndex={0}
            aria-label="Close dropdown"
            onClick={() => setIsDropdownOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                setIsDropdownOpen(false);
              }
            }}
          />
        )}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
