/* eslint-disable jsx-a11y/label-has-associated-control, no-restricted-syntax, consistent-return, no-continue, react/no-array-index-key */

"use client";

import React from "react";

import { PriceBreakdown } from "@/store/api";

import { formatNgn, formatUsd } from "./shared";

// Full internal breakdown of one price (simulator result or an order line's snapshot).
const BreakdownTable = ({ breakdown }: { breakdown: PriceBreakdown }) => {
  const rows: [string, string][] = [
    ["Tailor position in band", breakdown.position?.toString() ?? "-"],
    ["Tailor fee", formatNgn(breakdown.tailorNgn)],
    ["Cloth design", formatNgn(breakdown.designNgn)],
    ["Fabric", formatNgn(breakdown.fabricNgn)],
    ["Fabric units charged", breakdown.fabricUnitsCharged?.toString() ?? "-"],
    ["Fabric per yard", formatNgn(breakdown.fabricPerYardNgn)],
    ["Total cost (NGN)", formatNgn(breakdown.costNgn)],
    [
      "Effective rate (NGN per USD)",
      breakdown.effectiveRate?.toString() ?? "-",
    ],
    ["Cost (USD)", formatUsd(breakdown.costUsd)],
    ["Logistics", formatUsd(breakdown.logisticsUsd)],
    ["Subtotal", formatUsd(breakdown.subtotalUsd)],
    ["Markup", formatUsd(breakdown.markupUsd)],
    ["Risk reserve", formatUsd(breakdown.reserveUsd)],
    ["Payment fee", formatUsd(breakdown.paymentFeeUsd)],
    [
      "Margin",
      breakdown.marginPercent !== undefined
        ? `${breakdown.marginPercent}%${breakdown.marginFloorApplied ? " (floor applied)" : ""}`
        : "-",
    ],
    ["Unit price", formatUsd(breakdown.unitPriceUsd)],
  ];

  return (
    <div className="space-y-3">
      <table className="min-w-full text-sm">
        <tbody className="divide-y divide-gray-100">
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td className="py-1.5 pr-4 text-gray-500">{label}</td>
              <td className="py-1.5 font-medium text-gray-900">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {breakdown.flags && breakdown.flags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {breakdown.flags.map((flag) => (
            <span
              key={flag}
              className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
            >
              {flag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default BreakdownTable;
