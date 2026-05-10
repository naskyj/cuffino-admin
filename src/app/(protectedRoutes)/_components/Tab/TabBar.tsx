import React, { useState } from "react";

import { cn } from "@/lib/utils";

interface TabBarProps {
  tabs: string[];
  activeTab?: string;
  onTabChange?: (_tab: string) => void;
  className?: string;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  const [selectedTab, setSelectedTab] = useState(activeTab || tabs[0]);

  const handleTabClick = (tab: string) => {
    setSelectedTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className={cn("flex border-b border-gray-200", className)}>
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => handleTabClick(tab)}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            selectedTab === tab
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default TabBar;
