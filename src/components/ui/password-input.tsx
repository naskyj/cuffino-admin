"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { EyeOpen, EyesClose } from "./assets";

export interface PasswordInputProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  showPassword?: boolean;
  onTogglePassword?: () => void;
  label?: string;
  error?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      showPassword = false,
      onTogglePassword,
      label,
      error,
      ...props
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] =
      React.useState(showPassword);

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
      onTogglePassword?.();
    };

    return (
      <div className="">
        {label && (
          <label
            className="text-sm mb-2 font-medium text-foreground"
            htmlFor={props.id}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={isPasswordVisible ? "text" : "password"}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              error && "border-red-500 focus-visible:ring-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground focus:outline-none"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            {isPasswordVisible ? (
              <EyesClose className="h-4 w-4" />
            ) : (
              <EyeOpen className="h-4 w-4" />
            )}
          </button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
