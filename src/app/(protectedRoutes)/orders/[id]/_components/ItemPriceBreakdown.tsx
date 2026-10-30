"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useState } from "react";

import {
  useClearPriceReviewMutation,
  useGetOrderItemBreakdownQuery,
} from "@/store/api";
import { showToast } from "@/utilities/toast";

import BreakdownTable from "../../../pricing/_components/BreakdownTable";

// Per order line: a price-review banner (when flagged) and a collapsible cost breakdown.
// Renders nothing for lines without a pricing snapshot (e.g. fixed-price products).
const ItemPriceBreakdown = ({ orderItemId }: { orderItemId: number }) => {
  const { data } = useGetOrderItemBreakdownQuery(orderItemId);
  const [clearReview, { isLoading }] = useClearPriceReviewMutation();
  const [open, setOpen] = useState(false);

  if (!data || (!data.breakdown && !data.priceReviewRequired)) {
    return null;
  }

  const handleClear = async () => {
    try {
      const result = await clearReview(orderItemId).unwrap();
      showToast.success(
        result.productionHoldReleased
          ? "Price review cleared and production hold lifted"
          : "Price review cleared"
      );
    } catch (error: any) {
      showToast.error(error?.data?.message || "Failed to clear price review");
    }
  };

  return (
    <div className="space-y-3">
      {data.priceReviewRequired && (
        <div className="rounded-lg border-2 border-amber-400 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Price review required
            </p>
            <p className="text-sm text-amber-800">
              {data.priceReviewReason ||
                "This line was priced through a fallback. Check the breakdown before production."}
            </p>
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleClear}
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 whitespace-nowrap"
          >
            Clear price review
          </button>
        </div>
      )}

      {data.breakdown && (
        <div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 text-sm font-semibold text-gray-700"
          >
            {open ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            Price breakdown
          </button>
          {open && (
            <div className="mt-2 rounded-md border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-2">
                {data.pieceOption === "THREE_PIECE" ? "3-piece" : "2-piece"}
                {data.clothDesign ? ", cloth design" : ""}
                {data.pricingVersion != null &&
                  ` - pricing version ${data.pricingVersion}`}
              </p>
              {(data.breakdown as any).lockNote && (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-2 mb-2">
                  Customer was charged ${Number((data.breakdown as any).chargedUnitPriceUsd ?? data.unitPrice).toFixed(2)} (locked
                  quote). {(data.breakdown as any).lockNote}
                </p>
              )}
              <BreakdownTable breakdown={data.breakdown} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ItemPriceBreakdown;
