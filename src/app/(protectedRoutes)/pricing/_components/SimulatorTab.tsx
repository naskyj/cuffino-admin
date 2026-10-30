/* eslint-disable jsx-a11y/label-has-associated-control, no-restricted-syntax, consistent-return, no-continue, react/no-array-index-key */

"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui";
import {
  PieceOption,
  SimulationResult,
  useGetPricingFabricsQuery,
  useGetPricingStylesQuery,
  useSimulatePriceMutation,
} from "@/store/api";

import BreakdownTable from "./BreakdownTable";
import {
  apiErrorMessage,
  cardClass,
  Field,
  formatUsd,
  inputClass,
  Notice,
  SectionTitle,
  toNum,
} from "./shared";

const SimulatorTab = () => {
  const { data: styles = [] } = useGetPricingStylesQuery();
  const { data: fabrics = [] } = useGetPricingFabricsQuery();
  const [simulate, { isLoading }] = useSimulatePriceMutation();
  const [productId, setProductId] = useState("");
  const [pieceOption, setPieceOption] = useState("");
  const [fabricId, setFabricId] = useState("");
  const [clothDesign, setClothDesign] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [ageMonths, setAgeMonths] = useState("");
  const [orders, setOrders] = useState("");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState("");

  const simulatable = styles.filter((s) => s.productId);

  const run = async () => {
    setResult(null);
    if (!productId) return setError("Pick a style");
    const qty = toNum(quantity);
    const age = toNum(ageMonths);
    const done = toNum(orders);
    if (qty !== undefined && (!Number.isInteger(qty) || qty < 1)) {
      return setError("Quantity must be a whole number, 1 or more");
    }
    if (
      [age, done].some((n) => n !== undefined && (Number.isNaN(n) || n < 0))
    ) {
      return setError("Customer age and orders must be non-negative numbers");
    }
    setError("");
    try {
      setResult(
        await simulate({
          productId: Number(productId),
          pieceOption: (pieceOption || undefined) as PieceOption | undefined,
          fabricInventoryId: fabricId ? Number(fabricId) : undefined,
          clothDesign,
          quantity: qty,
          accountAgeMonths: age,
          completedOrders: done,
        }).unwrap()
      );
    } catch (e: any) {
      setError(apiErrorMessage(e, "Simulation failed"));
    }
  };

  return (
    <div className="space-y-6">
      <div className={cardClass}>
        <SectionTitle
          title="Price simulator"
          subtitle="Runs the real pricing engine without creating a quote or order."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Style">
            <select
              className={inputClass}
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Select a style</option>
              {simulatable.map((s) => (
                <option key={s.styleCode} value={s.productId as number}>
                  {s.styleCode} - {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Option">
            <select
              className={inputClass}
              value={pieceOption}
              onChange={(e) => setPieceOption(e.target.value)}
            >
              <option value="">Default</option>
              <option value="TWO_PIECE">2-piece</option>
              <option value="THREE_PIECE">3-piece</option>
            </select>
          </Field>
          <Field label="Fabric">
            <select
              className={inputClass}
              value={fabricId}
              onChange={(e) => setFabricId(e.target.value)}
            >
              <option value="">Style default</option>
              {fabrics
                .filter((f) => f.inventoryId)
                .map((f) => (
                  <option key={f.fabricCode} value={f.inventoryId as number}>
                    {f.fabricCode} - {f.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Quantity">
            <input
              type="number"
              min="1"
              className={inputClass}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Field>
          <Field label="Customer account age (months, optional)">
            <input
              type="number"
              min="0"
              className={inputClass}
              value={ageMonths}
              onChange={(e) => setAgeMonths(e.target.value)}
            />
          </Field>
          <Field label="Customer completed orders (optional)">
            <input
              type="number"
              min="0"
              className={inputClass}
              value={orders}
              onChange={(e) => setOrders(e.target.value)}
            />
          </Field>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={clothDesign}
            onChange={(e) => setClothDesign(e.target.checked)}
          />
          Add cloth design
        </label>
        <div className="mt-4 flex justify-end">
          <Button onClick={run} loading={isLoading}>
            Simulate
          </Button>
        </div>
      </div>

      {error && <Notice tone="error">{error}</Notice>}

      {result && (
        <div className={`${cardClass} space-y-4`}>
          <div>
            <p className="text-sm text-gray-500">Unit price</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatUsd(result.unitPrice)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {result.pieceOption === "THREE_PIECE" ? "3-piece" : "2-piece"}
              {result.clothDesign ? ", cloth design" : ""} - pricing version{" "}
              {result.pricingVersion}
            </p>
          </div>

          {result.breakdown ? (
            <BreakdownTable breakdown={result.breakdown} />
          ) : (
            <Notice tone="warning">
              No breakdown: this was a fixed-price fallback.
            </Notice>
          )}

          {result.reviewReasons.length > 0 && (
            <Notice tone="warning">
              <p className="font-semibold mb-1">Would need price review</p>
              <ul className="list-disc ml-5">
                {result.reviewReasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </Notice>
          )}
          {result.notes.length > 0 && (
            <Notice tone="info">
              <p className="font-semibold mb-1">Notes</p>
              <ul className="list-disc ml-5">
                {result.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </Notice>
          )}
          {result.appliedRules.length > 0 && (
            <p className="text-sm text-gray-700">
              Applied rules: {result.appliedRules.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SimulatorTab;
