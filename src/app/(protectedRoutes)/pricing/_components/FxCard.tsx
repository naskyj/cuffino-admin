/* eslint-disable jsx-a11y/label-has-associated-control, no-restricted-syntax, consistent-return, no-continue, react/no-array-index-key */

"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui";
import { useGetPricingConfigQuery, useSetFxRateMutation } from "@/store/api";
import { showToast } from "@/utilities/toast";

import {
  apiErrorMessage,
  cardClass,
  formatDate,
  inputClass,
  Notice,
  SectionTitle,
} from "./shared";

interface Props {
  isAdmin: boolean;
  // Read-only values for managers, who cannot call the ADMIN-only config endpoint.
  fallback?: { rate: number; source?: string; stale: boolean };
}

const FxCard = ({ isAdmin, fallback }: Props) => {
  const { data: config } = useGetPricingConfigQuery(undefined, {
    skip: !isAdmin,
  });
  const [setFxRate, { isLoading }] = useSetFxRateMutation();
  const [rate, setRate] = useState("");
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  // Set when the API says the move is bigger than the guard and wants an explicit confirmation.
  const [needsConfirm, setNeedsConfirm] = useState(false);

  const currentRate = config?.currentFxRate ?? fallback?.rate;
  const currentSource = config?.fxSource ?? fallback?.source;
  const stale = config?.fxStale ?? fallback?.stale ?? false;

  const submit = async (confirmLargeChange: boolean) => {
    const value = Number(rate);
    if (rate.trim() === "" || Number.isNaN(value) || value <= 0) {
      setError("Enter a rate greater than zero");
      return;
    }
    setError("");
    try {
      await setFxRate({
        ngnPerUsd: value,
        source: source || undefined,
        confirmLargeChange: confirmLargeChange || undefined,
      }).unwrap();
      showToast.success("FX rate updated");
      setRate("");
      setSource("");
      setNeedsConfirm(false);
    } catch (e: any) {
      const message = apiErrorMessage(e, "Failed to update FX rate");
      setError(message);
      setNeedsConfirm(e?.status === 400 && /confirm/i.test(message));
    }
  };

  return (
    <div className={cardClass}>
      <SectionTitle title="Exchange rate" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
        <div>
          <span className="text-gray-500">Current rate</span>
          <p className="text-lg font-semibold text-gray-900">
            {currentRate !== undefined ? `₦${currentRate} / $1` : "-"}
          </p>
        </div>
        <div>
          <span className="text-gray-500">Source</span>
          <p className="font-medium text-gray-900">{currentSource || "-"}</p>
        </div>
        <div>
          <span className="text-gray-500">Updated</span>
          <p className="font-medium text-gray-900">
            {formatDate(config?.fxUpdatedAt)}
            {stale && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                Stale
              </span>
            )}
          </p>
        </div>
      </div>

      {isAdmin ? (
        <div className="space-y-3">
          {error && (
            <Notice tone={needsConfirm ? "warning" : "error"}>{error}</Notice>
          )}
          <div className="flex flex-col md:flex-row gap-3 md:items-end">
            <label className="text-sm font-medium text-gray-700">
              New rate (NGN per USD)
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={rate}
                onChange={(e) => {
                  setRate(e.target.value);
                  setNeedsConfirm(false);
                }}
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Source (optional)
              <input
                className={inputClass}
                value={source}
                placeholder="e.g. CBN, bank"
                onChange={(e) => setSource(e.target.value)}
              />
            </label>
            {needsConfirm ? (
              <Button
                variant="destructive"
                loading={isLoading}
                onClick={() => submit(true)}
              >
                Confirm large change
              </Button>
            ) : (
              <Button loading={isLoading} onClick={() => submit(false)}>
                Set rate
              </Button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500">
          Only an admin can change the rate.
        </p>
      )}
    </div>
  );
};

export default FxCard;
