import { ChevronDown, Search, X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (_value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = "Select an option",
      label,
      error,
      disabled = false,
      searchable = true,
      clearable = true,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [focusedIndex, setFocusedIndex] = React.useState(-1);
    const selectRef = React.useRef<HTMLDivElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const listRef = React.useRef<HTMLUListElement>(null);

    // Get the selected option
    const selectedOption = options.find((option) => option.value === value);

    // Filter options based on search term
    const filteredOptions = React.useMemo(() => {
      if (!searchable || !searchTerm) return options;
      return options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [options, searchTerm, searchable]);

    // Handle click outside to close dropdown
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          selectRef.current &&
          !selectRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchTerm("");
          setFocusedIndex(-1);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus search input when dropdown opens
    React.useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    // Handle option selection
    const handleSelect = (optionValue: string) => {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchTerm("");
      setFocusedIndex(-1);
    };

    // Handle keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (!isOpen) {
        if (
          event.key === "Enter" ||
          event.key === " " ||
          event.key === "ArrowDown"
        ) {
          event.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setFocusedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case "Enter":
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
            const option = filteredOptions[focusedIndex];
            if (!option.disabled) {
              handleSelect(option.value);
            }
          }
          break;
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          setSearchTerm("");
          setFocusedIndex(-1);
          break;
        case "Tab":
          setIsOpen(false);
          setSearchTerm("");
          setFocusedIndex(-1);
          break;
        default:
          break;
      }
    };

    // Handle clear selection
    const handleClear = (event: React.MouseEvent) => {
      event.stopPropagation();
      onChange?.("");
    };

    // Handle toggle dropdown
    const handleToggle = () => {
      if (disabled) return;
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm("");
        setFocusedIndex(-1);
      }
    };

    // Scroll focused option into view
    React.useEffect(() => {
      if (focusedIndex >= 0 && listRef.current) {
        const focusedElement = listRef.current.children[
          focusedIndex
        ] as HTMLElement;
        if (focusedElement) {
          focusedElement.scrollIntoView({
            block: "nearest",
            behavior: "smooth",
          });
        }
      }
    }, [focusedIndex]);

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
          ref={selectRef}
          className="relative"
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="listbox"
          aria-disabled={disabled}
        >
          {/* Select Trigger */}
          <button
            type="button"
            className={cn(
              "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500 focus:ring-red-500",
              isOpen && "ring-1 ring-ring ring-offset-1"
            )}
            onClick={handleToggle}
            disabled={disabled}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-label={label || placeholder}
          >
            <span
              className={cn(
                "truncate",
                !selectedOption && "text-muted-foreground"
              )}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <div className="flex items-center gap-1">
              {clearable && selectedOption && !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-sm p-0.5 hover:bg-accent hover:text-accent-foreground"
                  aria-label="Clear selection"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </div>
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
              {searchable && (
                <div className="relative mb-1">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-sm border-0 bg-transparent pl-8 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0"
                    placeholder="Search options..."
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              <ul
                ref={listRef}
                className="max-h-60 overflow-auto"
                role="listbox"
                aria-label={label || "Options"}
              >
                {filteredOptions.length === 0 ? (
                  <li className="px-2 py-1.5 text-sm text-muted-foreground">
                    No options found
                  </li>
                ) : (
                  filteredOptions.map((option, index) => (
                    <li
                      key={option.value}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        "focus:bg-accent focus:text-accent-foreground",
                        option.disabled && "cursor-not-allowed opacity-50",
                        index === focusedIndex &&
                          "bg-accent text-accent-foreground",
                        option.value === value &&
                          "bg-accent text-accent-foreground"
                      )}
                      onClick={() =>
                        !option.disabled && handleSelect(option.value)
                      }
                      onKeyDown={(e) => {
                        if (
                          !option.disabled &&
                          (e.key === "Enter" || e.key === " ")
                        ) {
                          e.preventDefault();
                          handleSelect(option.value);
                        }
                      }}
                      tabIndex={option.disabled ? -1 : 0}
                      role="option"
                      aria-selected={option.value === value}
                      aria-disabled={option.disabled}
                    >
                      {option.label}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
