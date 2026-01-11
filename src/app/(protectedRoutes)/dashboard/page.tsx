"use client";

import React from "react";

import { StatCard } from "../_components";
import PageHeader from "../_components/PageHeader";

const DashboardPage = () => {
  // Mock data - in real app, this would come from API
  const stats = [
    { label: "Total Users", value: "1,234" },
    { label: "Total Orders", value: "567" },
    { label: "Total Revenue", value: "$12,345" },
    { label: "Active Products", value: "89" },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "New order placed",
      user: "John Doe",
      time: "2 minutes ago",
    },
    {
      id: 2,
      action: "Payment received",
      user: "Jane Smith",
      time: "5 minutes ago",
    },
    { id: 3, action: "Product updated", user: "Admin", time: "10 minutes ago" },
    {
      id: 4,
      action: "New user registered",
      user: "Bob Johnson",
      time: "15 minutes ago",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your business today."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">by {activity.user}</p>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="text-sm font-medium text-gray-900">
                Add Product
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Create new product listing
              </div>
            </button>
            <button
              type="button"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="text-sm font-medium text-gray-900">
                View Orders
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Check recent orders
              </div>
            </button>
            <button
              type="button"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="text-sm font-medium text-gray-900">
                Manage Users
              </div>
              <div className="text-xs text-gray-500 mt-1">
                User administration
              </div>
            </button>
            <button
              type="button"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="text-sm font-medium text-gray-900">
                View Reports
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Analytics & insights
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
