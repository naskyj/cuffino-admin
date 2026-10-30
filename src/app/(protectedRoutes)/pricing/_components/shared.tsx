/* eslint-disable jsx-a11y/label-has-associated-control, no-restricted-syntax, consistent-return, no-continue, react/no-array-index-key */

"use client";

import React from "react";

import { cn } from "@/lib/utils";

export const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-400";

export const cardClass = "bg-white rounded-lg border border-gray-200 p-6";

const ngnFormatter = new Intl.NumberFormat("en-NG", {
  maximumFractionDigits: 2,
});

export const formatNgn = (value?: number | null) =>
  value === null || value === undefined
    ? "-"
    : `₦${ngnFormatter.format(Number(value))}`;

export const formatUsd = (value?: number | null) =>
  value === null || value === undefined ? "-" : `$${Number(value).toFixed(2)}`;

export const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "-";

// Surfaces the API's own message verbatim (400/409 bodies carry a "message").
export const apiErrorMessage = (error: any, fallback: string): string =>
  error?.data?.message ||
  (typeof error?.data === "string" && error.data) ||
  fallback;

// Empty input -> undefined (field not sent); otherwise the number (NaN is caught by validators).
export const toNum = (value: string): number | undefined =>
  value.trim() === "" ? undefined : Number(value);

export const numStr = (value?: number | null) =>
  value === null || value === undefined ? "" : String(value);

export const isNegativeOrNaN = (value?: number) =>
  value !== undefined && (Number.isNaN(value) || value < 0);

export const Field = ({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {children}
    </label>
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>
);

export const IssueBadges = ({ issues }: { issues?: string[] }) => {
  if (!issues || issues.length === 0) {
    return (
      <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        Ready
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1 max-w-sm whitespace-normal">
      {issues.map((issue, i) => (
        <span
          key={`${issue}-${i}`}
          className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
        >
          {issue}
        </span>
      ))}
    </div>
  );
};

export const StatusPill = ({
  on,
  onLabel,
  offLabel,
}: {
  on: boolean;
  onLabel: string;
  offLabel: string;
}) => (
  <span
    className={cn(
      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
      on ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
    )}
  >
    {on ? onLabel : offLabel}
  </span>
);

export const Notice = ({
  tone,
  children,
}: {
  tone: "warning" | "error" | "info";
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      "rounded-md border px-4 py-3 text-sm",
      tone === "warning" && "border-amber-200 bg-amber-50 text-amber-800",
      tone === "error" && "border-red-200 bg-red-50 text-red-800",
      tone === "info" && "border-blue-200 bg-blue-50 text-blue-800"
    )}
  >
    {children}
  </div>
);

export const SectionTitle = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => (
  <div className="mb-4">
    <h3 className="text-base font-semibold text-gray-900">{title}</h3>
    {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
  </div>
);
