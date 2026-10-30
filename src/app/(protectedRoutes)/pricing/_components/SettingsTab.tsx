/* eslint-disable jsx-a11y/label-has-associated-control, no-restricted-syntax, consistent-return, no-continue, react/no-array-index-key */

"use client";

import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui";
import {
  FabricPriceBasis,
  PriceRounding,
  PricingConfig,
  useGetFxHistoryQuery,
  useGetPricingConfigQuery,
  useUpdatePricingConfigMutation,
} from "@/store/api";
import { showToast } from "@/utilities/toast";

import DataTable from "../../_components/DataTable";
import FxCard from "./FxCard";
import {
  apiErrorMessage,
  cardClass,
  Field,
  formatDate,
  inputClass,
  Notice,
  SectionTitle,
} from "./shared";

type NumKey =
  | "fxBufferPercent"
  | "fxStaleHours"
  | "fxStaleExtraBufferPct"
  | "fxChangeGuardPercent"
  | "markupPercent"
  | "riskReservePercent"
  | "logisticsTwoPieceUsd"
  | "logisticsThreePieceUsd"
  | "paymentFeePercent"
  | "paymentFeeFixedUsd"
  | "marginFloorPercent"
  | "quoteLockHours"
  | "fallbackYardsTwoPiece"
  | "fallbackYardsThreePiece"
  | "emergencyPriceUsd"
  | "tailorBasePosition";

const intKeys: NumKey[] = ["fxStaleHours", "quoteLockHours"];

interface NumField {
  key: NumKey;
  label: string;
  hint?: string;
  max?: number;
}

const groups: { title: string; subtitle?: string; fields: NumField[] }[] = [
  {
    title: "FX buffer and stale handling",
    subtitle:
      "Protects you from the naira moving against you between pricing and payment.",
    fields: [
      {
        key: "fxBufferPercent",
        label: "FX buffer (%)",
        hint: "Shaves this much off the rate used for pricing.",
        max: 100,
      },
      { key: "fxStaleHours", label: "Rate is stale after (hours)" },
      {
        key: "fxStaleExtraBufferPct",
        label: "Extra buffer when stale (%)",
        max: 100,
      },
      {
        key: "fxChangeGuardPercent",
        label: "Large-change guard (%)",
        hint: "A new rate moving more than this needs confirmation.",
        max: 100,
      },
    ],
  },
  {
    title: "Margin and fees",
    fields: [
      { key: "markupPercent", label: "Markup (%)", max: 1000 },
      { key: "riskReservePercent", label: "Risk reserve (%)", max: 1000 },
      { key: "paymentFeePercent", label: "Payment fee (%)", max: 100 },
      { key: "paymentFeeFixedUsd", label: "Payment fixed fee (USD)" },
      {
        key: "marginFloorPercent",
        label: "Margin floor (%)",
        hint: "Prices are raised, never blocked, if margin would fall below this.",
        max: 100,
      },
    ],
  },
  {
    title: "Logistics (default per option)",
    fields: [
      { key: "logisticsTwoPieceUsd", label: "2-piece logistics (USD)" },
      { key: "logisticsThreePieceUsd", label: "3-piece logistics (USD)" },
    ],
  },
  {
    title: "Quotes, fallbacks and tailor position",
    fields: [
      {
        key: "quoteLockHours",
        label: "Quote lock (hours)",
        hint: "How long a shown price is honoured in the cart.",
      },
      {
        key: "fallbackYardsTwoPiece",
        label: "Fallback yards, 2-piece",
        hint: "Used when a fabric has no yardage.",
      },
      { key: "fallbackYardsThreePiece", label: "Fallback yards, 3-piece" },
      {
        key: "emergencyPriceUsd",
        label: "Emergency price (USD)",
        hint: "Last-resort price if the engine cannot price an item; the order is flagged for review.",
      },
      {
        key: "tailorBasePosition",
        label: "Tailor base position (0 to 1)",
        hint: "0 = tailor minimum, 1 = maximum. Rules adjust from here.",
        max: 1,
      },
    ],
  },
];

const basisHelp: Record<FabricPriceBasis, string> = {
  LOW: "Low: use the fabric's lowest listed price (cheapest, riskiest).",
  MID: "Mid: use the middle of the low and high price (balanced).",
  HIGH: "High: use the highest listed price (safest, most expensive).",
};

const SettingsTab = () => {
  const { data: config, isLoading } = useGetPricingConfigQuery();
  const { data: history = [], isLoading: historyLoading } =
    useGetFxHistoryQuery();
  const [updateConfig, { isLoading: isSaving }] =
    useUpdatePricingConfigMutation();
  const [values, setValues] = useState<Record<string, string>>({});
  const [rounding, setRounding] = useState<PriceRounding>("CEIL_DOLLAR");
  const [basis, setBasis] = useState<FabricPriceBasis>("MID");
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);

  const load = (c: PricingConfig) => {
    const next: Record<string, string> = {};
    groups.forEach((g) =>
      g.fields.forEach((f) => {
        next[f.key] = String(c[f.key] ?? "");
      })
    );
    setValues(next);
    setRounding(c.roundingMode);
    setBasis(c.fabricPriceBasis);
  };

  useEffect(() => {
    if (config) load(config);
  }, [config]);

  const handleSave = async () => {
    if (!config) return;
    setError("");
    setConflict(false);
    const payload: Record<string, number | string> = {};
    for (const group of groups) {
      for (const field of group.fields) {
        const raw = values[field.key];
        const num = Number(raw);
        if (
          raw === undefined ||
          raw.trim() === "" ||
          Number.isNaN(num) ||
          num < 0
        ) {
          setError(`${field.label} must be a non-negative number`);
          return;
        }
        if (field.max !== undefined && num > field.max) {
          setError(`${field.label} cannot be more than ${field.max}`);
          return;
        }
        if (intKeys.includes(field.key) && !Number.isInteger(num)) {
          setError(`${field.label} must be a whole number`);
          return;
        }
        payload[field.key] = num;
      }
    }
    try {
      await updateConfig({
        ...payload,
        roundingMode: rounding,
        fabricPriceBasis: basis,
        expectedVersion: config.version,
      }).unwrap();
      showToast.success("Pricing settings saved");
    } catch (e: any) {
      if (e?.status === 409) {
        setConflict(true);
      }
      setError(apiErrorMessage(e, "Failed to save settings"));
    }
  };

  if (isLoading || !config) {
    return <p className="text-gray-500">Loading settings...</p>;
  }

  return (
    <div className="space-y-6">
      <FxCard isAdmin />

      {error && (
        <Notice tone="error">
          {conflict
            ? "Someone else changed these settings while you were editing. Reload the latest values and re-apply your changes. "
            : ""}
          {error}
          {conflict && (
            <button
              type="button"
              className="ml-3 underline font-medium"
              onClick={() => {
                load(config);
                setError("");
                setConflict(false);
              }}
            >
              Discard my edits and reload
            </button>
          )}
        </Notice>
      )}

      {groups.map((group) => (
        <div key={group.title} className={cardClass}>
          <SectionTitle title={group.title} subtitle={group.subtitle} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {group.fields.map((field) => (
              <Field key={field.key} label={field.label} hint={field.hint}>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className={inputClass}
                  value={values[field.key] ?? ""}
                  onChange={(e) =>
                    setValues((current) => ({
                      ...current,
                      [field.key]: e.target.value,
                    }))
                  }
                />
              </Field>
            ))}
          </div>
        </div>
      ))}

      <div className={cardClass}>
        <SectionTitle title="Rounding and fabric price" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Rounding mode">
            <select
              className={inputClass}
              value={rounding}
              onChange={(e) => setRounding(e.target.value as PriceRounding)}
            >
              <option value="NONE">None (exact cents)</option>
              <option value="NEAREST_DOLLAR">Nearest dollar</option>
              <option value="CEIL_DOLLAR">Up to the whole dollar</option>
              <option value="CHARM_99">Charm price (ends in .99)</option>
            </select>
          </Field>
          <Field label="Fabric price basis" hint={basisHelp[basis]}>
            <select
              className={inputClass}
              value={basis}
              onChange={(e) => setBasis(e.target.value as FabricPriceBasis)}
            >
              <option value="LOW">Low</option>
              <option value="MID">Mid</option>
              <option value="HIGH">High</option>
            </select>
          </Field>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          A fabric with a Confirmed price always uses that price. The basis only
          applies to fabrics that have a Low and High range.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Version {config.version}
          {config.updatedBy && ` - last updated by ${config.updatedBy}`}
          {config.updatedAt && ` on ${formatDate(config.updatedAt)}`}
        </p>
        <Button onClick={handleSave} loading={isSaving}>
          Save settings
        </Button>
      </div>

      <div className={cardClass}>
        <SectionTitle title="FX history" />
        <DataTable
          data={history}
          loading={historyLoading}
          emptyMessage="No rate changes recorded."
          columns={[
            {
              key: "createdAt",
              header: "When",
              render: (v: unknown) => formatDate(v as string),
            },
            { key: "ngnPerUsd", header: "NGN per USD" },
            {
              key: "source",
              header: "Source",
              render: (v: unknown) => (v as string) || "-",
            },
            {
              key: "createdBy",
              header: "By",
              render: (v: unknown) => (v as string) || "-",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default SettingsTab;
