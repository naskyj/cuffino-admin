import React from "react";

interface StatCardProps {
  label: string;
  value: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  className = "",
}) => (
  <div
    className={`bg-white rounded-lg min-w-[274px] h-[96px] p-4  border-[0.5px] border-gray-200 ${className}`}
  >
    <div className="space-y-2">
      <p className="text-sm font-normal text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-black">{value}</p>
    </div>
  </div>
);

export default StatCard;
