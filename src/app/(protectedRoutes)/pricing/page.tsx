"use client";

import React, { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { isAdminRole } from "@/utilities";

import PageHeader from "../_components/PageHeader";
import FabricsTab from "./_components/FabricsTab";
import OverviewTab from "./_components/OverviewTab";
import RulesTab from "./_components/RulesTab";
import SettingsTab from "./_components/SettingsTab";
import SimulatorTab from "./_components/SimulatorTab";
import StylesTab from "./_components/StylesTab";

type TabId =
  | "overview"
  | "styles"
  | "fabrics"
  | "settings"
  | "rules"
  | "simulator";

const tabs: { id: TabId; label: string; adminOnly?: boolean }[] = [
  { id: "overview", label: "Overview" },
  { id: "styles", label: "Styles" },
  { id: "fabrics", label: "Fabrics" },
  { id: "settings", label: "Settings", adminOnly: true },
  { id: "rules", label: "Tailor rules", adminOnly: true },
  { id: "simulator", label: "Simulator" },
];

const PricingPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  // Read after mount: the role lives in a cookie, so SSR cannot know it.
  const [isAdmin, setIsAdmin] = useState(false);

  // Deep links from other pages: /pricing?tab=styles&new=1 or &edit=<styleCode>
  const [styleAction, setStyleAction] = useState<{
    create?: boolean;
    edit?: string;
  }>({});

  useEffect(() => {
    setIsAdmin(isAdminRole());
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") as TabId | null;
    if (tab && tabs.some((t) => t.id === tab)) setActiveTab(tab);
    if (params.get("new")) setStyleAction({ create: true });
    else if (params.get("edit")) setStyleAction({ edit: params.get("edit")! });
  }, []);

  const visibleTabs = tabs.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing"
        subtitle="Styles, fabrics and the settings that turn naira costs into customer prices"
      />

      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <OverviewTab isAdmin={isAdmin} />}
      {activeTab === "styles" && <StylesTab initialAction={styleAction} />}
      {activeTab === "fabrics" && <FabricsTab />}
      {activeTab === "settings" && isAdmin && <SettingsTab />}
      {activeTab === "rules" && isAdmin && <RulesTab />}
      {activeTab === "simulator" && <SimulatorTab />}
    </div>
  );
};

export default PricingPage;
