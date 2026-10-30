/* eslint-disable jsx-a11y/label-has-associated-control, no-restricted-syntax, consistent-return, no-continue, react/no-array-index-key */

"use client";

import { Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui";
import {
  PricingRule,
  useGetPricingRulesQuery,
  useUpdatePricingRuleMutation,
} from "@/store/api";
import { showToast } from "@/utilities/toast";

import { apiErrorMessage, cardClass, inputClass, Notice } from "./shared";

const metricLabel: Record<string, string> = {
  ACCOUNT_AGE_MONTHS: "account age in months",
  COMPLETED_ORDERS: "number of completed orders",
};

interface TierForm {
  from: string;
  delta: string;
}

const RuleCard = ({ rule }: { rule: PricingRule }) => {
  const [updateRule, { isLoading }] = useUpdatePricingRuleMutation();
  const [name, setName] = useState(rule.name);
  const [priority, setPriority] = useState(String(rule.priority));
  const [tiers, setTiers] = useState<TierForm[]>(
    rule.tiers.map((t) => ({ from: String(t.from), delta: String(t.delta) }))
  );
  const [error, setError] = useState("");

  const toggleEnabled = async () => {
    try {
      await updateRule({
        ruleId: rule.ruleId,
        data: { enabled: !rule.enabled },
      }).unwrap();
      showToast.success(rule.enabled ? "Rule disabled" : "Rule enabled");
    } catch (e: any) {
      showToast.error(apiErrorMessage(e, "Failed to update rule"));
    }
  };

  const setTier = (index: number, patch: Partial<TierForm>) =>
    setTiers((current) =>
      current.map((t, i) => (i === index ? { ...t, ...patch } : t))
    );

  const save = async () => {
    const parsed = [];
    for (const tier of tiers) {
      const from = Number(tier.from);
      const delta = Number(tier.delta);
      if (tier.from.trim() === "" || Number.isNaN(from) || from < 0) {
        return setError("Each tier needs a non-negative 'from' value");
      }
      if (
        tier.delta.trim() === "" ||
        Number.isNaN(delta) ||
        delta < -1 ||
        delta > 1
      ) {
        return setError("Each effect must be a number between -1 and 1");
      }
      parsed.push({ from, delta });
    }
    const prio = Number(priority);
    if (!Number.isInteger(prio) || prio < 0) {
      return setError("Priority must be a whole number, 0 or more");
    }
    if (!name.trim()) return setError("Name is required");
    setError("");
    try {
      await updateRule({
        ruleId: rule.ruleId,
        data: { name: name.trim(), tiers: parsed, priority: prio },
      }).unwrap();
      showToast.success("Rule saved");
    } catch (e: any) {
      setError(apiErrorMessage(e, "Failed to save rule"));
    }
  };

  const metric = metricLabel[rule.metric] || rule.metric;

  return (
    <div className={`${cardClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {rule.factor.replace("_", " ").toLowerCase()}
          </p>
          <input
            aria-label="Rule name"
            className={`${inputClass} font-semibold`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            role="switch"
            checked={rule.enabled}
            onChange={toggleEnabled}
          />
          {rule.enabled ? "Enabled" : "Disabled"}
        </label>
      </div>

      <p className="text-sm text-gray-600">
        This rule looks at the customer&apos;s {metric}. The tier with the
        highest &quot;from&quot; that is still at or below the customer&apos;s
        value wins.
      </p>

      {error && <Notice tone="error">{error}</Notice>}

      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-3 text-xs font-medium text-gray-500">
          <span>From ({metric})</span>
          <span>Effect on tailor band</span>
          <span />
        </div>
        {tiers.map((tier, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3">
            <input
              type="number"
              min="0"
              aria-label="From"
              className={inputClass}
              value={tier.from}
              onChange={(e) => setTier(i, { from: e.target.value })}
            />
            <input
              type="number"
              min="-1"
              max="1"
              step="0.01"
              aria-label="Effect"
              className={inputClass}
              value={tier.delta}
              onChange={(e) => setTier(i, { delta: e.target.value })}
            />
            <button
              type="button"
              aria-label="Remove tier"
              className="text-red-600 hover:text-red-700"
              onClick={() => setTiers((c) => c.filter((_, idx) => idx !== i))}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          onClick={() => setTiers((c) => [...c, { from: "", delta: "" }])}
        >
          <Plus className="w-4 h-4" /> Add tier
        </button>
        <p className="text-xs text-gray-500">
          Effect is a signed share of the tailor band, from -1 to 1. Negative
          moves the price toward the minimum: -0.10 = 10% closer to the minimum.
          Positive moves it toward the maximum.
        </p>
      </div>

      <div className="flex items-end justify-between gap-3">
        <label className="text-sm font-medium text-gray-700">
          Priority
          <input
            type="number"
            min="0"
            className={`${inputClass} w-28`}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          />
        </label>
        <Button onClick={save} loading={isLoading}>
          Save rule
        </Button>
      </div>
    </div>
  );
};

const RulesTab = () => {
  const { data: rules = [], isLoading } = useGetPricingRulesQuery();

  if (isLoading) return <p className="text-gray-500">Loading rules...</p>;

  return (
    <div className="space-y-4">
      <Notice tone="info">
        Rules only choose a point inside the tailor&apos;s min/max band.
        Customer longevity rewards loyal customers: account age (months since
        sign-up) or completed orders (orders already delivered) can move the
        tailor fee closer to the minimum. Rules never change fabric or
        logistics.
      </Notice>
      {rules.map((rule) => (
        <RuleCard
          key={`${rule.ruleId}-${rule.name}-${rule.priority}`}
          rule={rule}
        />
      ))}
      {rules.length === 0 && (
        <p className="text-sm text-gray-500">No rules configured.</p>
      )}
    </div>
  );
};

export default RulesTab;
