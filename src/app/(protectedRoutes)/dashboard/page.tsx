"use client";

import React from "react";

import PageHeader from "../_components/PageHeader";
import { StatCard } from "../_components";
import {
  useGetAllOrdersQuery,
  useGetAllProductsQuery,
  useGetAllUsersQuery,
} from "@/store/api";

const DashboardPage = () => {
  const { data: users, isLoading: usersLoading } = useGetAllUsersQuery();
  const { data: orders, isLoading: ordersLoading } = useGetAllOrdersQuery();
  const { data: products, isLoading: productsLoading } =
    useGetAllProductsQuery();

  const isLoading = usersLoading || ordersLoading || productsLoading;

  // Calculate stats from real data
  const stats = [
    {
      label: "Total Users",
      value: users?.length?.toString() || "0",
    },
    {
      label: "Total Orders",
      value: orders?.length?.toString() || "0",
    },
    {
      label: "Total Revenue",
      value: orders
        ? `$${orders
            .reduce(
              (sum: number, order: { totalPrice?: number }) =>
                sum + (order.totalPrice || 0),
              0
            )
            .toFixed(2)}`
        : "$0.00",
    },
    {
      label: "Active Products",
      value: products?.length?.toString() || "0",
    },
  ];

  // Get recent orders for activity
  const recentOrders = orders
    ? orders
        .slice()
        .sort(
          (
            a: { orderDate?: string },
            b: { orderDate?: string }
          ) =>
            new Date(b.orderDate || 0).getTime() -
            new Date(a.orderDate || 0).getTime()
        )
        .slice(0, 4)
    : [];

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your business today."
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading dashboard data...</div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
              />
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Orders
              </h3>
              <div className="space-y-4">
                {recentOrders.length > 0 ? (
                  recentOrders.map(
                    (order: {
                      orderId?: number;
                      status?: string;
                      customerUsername?: string;
                      totalPrice?: number;
                      orderDate?: string;
                    }) => (
                      <div
                        key={order.orderId}
                        className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Order #{order.orderId} - {order.status || "PENDING"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.customerUsername || "Customer"} - $
                            {order.totalPrice?.toFixed(2) || "0.00"}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(order.orderDate || "")}
                        </span>
                      </div>
                    )
                  )
                ) : (
                  <div className="text-sm text-gray-500 py-4">
                    No recent orders
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="/products"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="text-sm font-medium text-gray-900">
                    Add Product
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Create new product listing
                  </div>
                </a>
                <a
                  href="/orders"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="text-sm font-medium text-gray-900">
                    View Orders
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Check recent orders
                  </div>
                </a>
                <a
                  href="/users"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="text-sm font-medium text-gray-900">
                    Manage Users
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    User administration
                  </div>
                </a>
                <a
                  href="/payments"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="text-sm font-medium text-gray-900">
                    View Payments
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Payment records
                  </div>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
