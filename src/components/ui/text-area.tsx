"use client";

import * as React from "react";
import {
  Control,
  FieldPath,
  FieldValues,
  useController,
} from "react-hook-form";

import { cn } from "@/lib/utils";

interface TextAreaProps<T extends FieldValues = FieldValues>
  extends Omit<React.ComponentProps<"textarea">, "name"> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
  rows?: number;
}

const TextArea = <T extends FieldValues = FieldValues>({
  name,
  control,
  label,
  placeholder,
  className,
  wrapperClassName,
  rows = 4,
  ...props
}: TextAreaProps<T>) => {
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
      <textarea
        {...field}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

TextArea.displayName = "TextArea";

export { TextArea };
