"use client";

import React, { useEffect, useState } from "react";

import { getUserRoleFromCookie } from "@/utilities";

import AdminDashboard from "./_components/AdminDashboard";
import ManagerDashboard from "./_components/ManagerDashboard";

const DashboardPage = () => {
  // Read on mount rather than at module scope - the role cookie isn't available during SSR,
  // and this avoids a hydration mismatch between server and client render.
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole((getUserRoleFromCookie() || "").toUpperCase());
  }, []);

  if (role === null) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return role === "MANAGER" ? <ManagerDashboard /> : <AdminDashboard />;
};

export default DashboardPage;
