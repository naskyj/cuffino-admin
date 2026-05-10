"use client";

import React from "react";

import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (_tabId: string) => void;
  className?: string;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => (
  <div
    className={cn(
      "bg-[#F4F4F5] w-fit  rounded-lg p-1 inline-flex items-center space-x-1",
      className
    )}
  >
    {tabs.map((tab) => {
      const isActive = activeTab === tab.id;

      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-4 py-2 rounded-md text-sm transition-all whitespace-nowrap duration-200 flex items-center space-x-2",
            "focus:outline-none focus:ring-0 focus:ring-teal-300 focus:ring-offset-0",
            isActive
              ? "bg-[#cc9acb2c] border border-[#8B62DE] text-gray-800 font-semibold"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
          )}
        >
          <span>{tab.label}</span>
          {isActive && tab.icon && <span className="ml-1">{tab.icon}</span>}
        </button>
      );
    })}
  </div>
);

export default TabBar;
