"use client";

import * as React from "react";
import {
  Control,
  FieldPath,
  FieldValues,
  useController,
} from "react-hook-form";

import { cn } from "@/lib/utils";

interface TextFieldProps<T extends FieldValues = FieldValues>
  extends Omit<React.ComponentProps<"input">, "name"> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  className?: string;
  wrapperClassName?: string;
}

const TextField = <T extends FieldValues = FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = "text",
  className,
  wrapperClassName,
  ...props
}: TextFieldProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <div className={cn("w-full", wrapperClassName)}>
      {label && (
        <label
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block"
          htmlFor={name}
        >
          {label}
        </label>
      )}
      <input
        {...field}
        type={type}
        placeholder={placeholder}
        className={cn(
          "flex h-10 text-sm w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

TextField.displayName = "TextField";

export { TextField };
