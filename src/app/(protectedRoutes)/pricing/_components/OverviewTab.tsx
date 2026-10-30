/* eslint-disable jsx-a11y/label-has-associated-control, no-restricted-syntax, consistent-return, no-continue, react/no-array-index-key */

"use client";

import React from "react";

import { useGetPricingReadinessQuery } from "@/store/api";

import FxCard from "./FxCard";
import { cardClass, IssueBadges, Notice, SectionTitle } from "./shared";

const OverviewTab = ({ isAdmin }: { isAdmin: boolean }) => {
  const { data, isLoading, isError } = useGetPricingReadinessQuery();

  if (isLoading) return <p className="text-gray-500">Loading readiness...</p>;
  if (isError || !data) {
    return <Notice tone="error">Could not load pricing readiness.</Notice>;
  }

  const notReady = data.styles.filter((s) => !s.ready);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {data.placeholderFx && (
          <Notice tone="warning">
            The FX rate is still the seeded placeholder ({data.fxRate} NGN per
            USD). Set the real rate before launch.
          </Notice>
        )}
        {data.fxStale && (
          <Notice tone="warning">
            The FX rate is stale; an extra buffer is being added to prices.
            Update the rate.
          </Notice>
        )}
        {data.globalIssues.map((issue) => (
          <Notice key={issue} tone="warning">
            {issue}
          </Notice>
        ))}
        {!data.placeholderFx &&
          !data.fxStale &&
          data.globalIssues.length === 0 && (
            <Notice tone="info">No global pricing issues.</Notice>
          )}
      </div>

      <FxCard
        isAdmin={isAdmin}
        fallback={{
          rate: data.fxRate,
          source: data.fxSource,
          stale: data.fxStale,
        }}
      />

      <div className={cardClass}>
        <SectionTitle
          title={`Styles (${data.styles.length - notReady.length} of ${data.styles.length} ready)`}
          subtitle="Styles with issues are hidden from customers."
        />
        <div className="divide-y divide-gray-100">
          {data.styles.map((s) => (
            <div
              key={s.styleCode}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2"
            >
              <span className="text-sm text-gray-900">
                <span className="font-medium">{s.styleCode}</span> - {s.name}
              </span>
              <IssueBadges issues={s.ready ? [] : s.issues} />
            </div>
          ))}
          {data.styles.length === 0 && (
            <p className="text-sm text-gray-500">No styles yet.</p>
          )}
        </div>
      </div>

      <div className={cardClass}>
        <SectionTitle
          title={`Fabrics with issues (${data.fabricsWithIssues.length})`}
          subtitle="These fabrics are not offered to customers until fixed."
        />
        <div className="divide-y divide-gray-100">
          {data.fabricsWithIssues.map((f) => (
            <div
              key={f.fabricCode}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2"
            >
              <span className="text-sm text-gray-900">
                <span className="font-medium">{f.fabricCode}</span> - {f.name}
              </span>
              <IssueBadges issues={f.issues} />
            </div>
          ))}
          {data.fabricsWithIssues.length === 0 && (
            <p className="text-sm text-gray-500">All fabrics are complete.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
