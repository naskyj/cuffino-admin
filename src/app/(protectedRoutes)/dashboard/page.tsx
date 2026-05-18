"use client";

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  useGetAllOrdersQuery,
  useGetAllProductsQuery,
  useGetAllUsersQuery,
} from "@/store/api";

import { StatCard } from "../_components";
import PageHeader from "../_components/PageHeader";

type DashboardOrder = {
  orderId?: number;
  status?: string;
  customerUsername?: string;
  totalPrice?: number;
  grandTotal?: number;
  orderDate?: string;
  items?: {
    productId?: number;
    productName?: string;
    quantity?: number;
  }[];
};

type DashboardProduct = {
  productId?: number;
  name?: string;
  productFabrics?: {
    inventory?: {
      inventoryId?: number;
      materialName?: string;
    };
  }[];
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  PARTIALLY_PAID: "#f97316",
  PAID: "#3b82f6",
  CONFIRMED: "#6366f1",
  IN_PROGRESS: "#8b5cf6",
  READY_FOR_DELIVERY: "#0d9488",
  DELIVERED: "#10b981",
  CANCELLED: "#ef4444",
};

const DashboardPage = () => {
  const { data: users, isLoading: usersLoading } = useGetAllUsersQuery();
  const { data: orders, isLoading: ordersLoading } = useGetAllOrdersQuery();
  const { data: products, isLoading: productsLoading } =
    useGetAllProductsQuery();

  const typedOrders = (orders || []) as DashboardOrder[];
  const typedProducts = (products || []) as DashboardProduct[];

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
              (sum: number, order: { grandTotal?: number; totalPrice?: number }) =>
                sum + (order.grandTotal ?? order.totalPrice ?? 0),
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
          (a: { orderDate?: string }, b: { orderDate?: string }) =>
            new Date(b.orderDate || 0).getTime() -
            new Date(a.orderDate || 0).getTime()
        )
        .slice(0, 4)
    : [];

  const ordersByStatus = Object.entries(
    typedOrders.reduce<Record<string, number>>((acc, order) => {
      const status = (order.status || "UNKNOWN").toUpperCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({
    status,
    count,
    fill: STATUS_COLORS[status] || "#6b7280",
  }));

  const revenueByDay = (() => {
    const last7Days = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      return {
        key,
        label: date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        revenue: 0,
      };
    });

    const bucket = new Map(last7Days.map((d) => [d.key, d]));
    typedOrders.forEach((order) => {
      if (!order.orderDate) {
        return;
      }
      const dayKey = new Date(order.orderDate).toISOString().slice(0, 10);
      const match = bucket.get(dayKey);
      if (match) {
        match.revenue += order.grandTotal ?? order.totalPrice ?? 0;
      }
    });

    return last7Days.map(({ label, revenue }) => ({
      day: label,
      revenue: Number(revenue.toFixed(2)),
    }));
  })();

  const topProducts = Object.values(
    typedOrders.reduce<
      Record<string, { name: string; totalQuantity: number; totalRevenue: number }>
    >((acc, order) => {
      (order.items || []).forEach((item) => {
        const key = `${item.productId || "unknown"}`;
        const name = item.productName || `Product #${item.productId || "N/A"}`;
        const quantity = item.quantity || 0;

        if (!acc[key]) {
          acc[key] = { name, totalQuantity: 0, totalRevenue: 0 };
        }

        acc[key].totalQuantity += quantity;
        const itemRevenue = quantity * (order.totalPrice || 0);
        acc[key].totalRevenue += itemRevenue;
      });
      return acc;
    }, {})
  )
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 5)
    .map((item) => ({
      name: item.name,
      quantity: item.totalQuantity,
    }));

  const fabricCoverage = (() => {
    const withDefaultFabric = typedProducts.filter(
      (product) => (product.productFabrics || []).length > 0
    ).length;
    const withoutDefaultFabric = Math.max(
      0,
      typedProducts.length - withDefaultFabric
    );
    return [
      {
        label: "With Default Fabric",
        value: withDefaultFabric,
        fill: "#10b981",
      },
      {
        label: "No Default Fabric",
        value: withoutDefaultFabric,
        fill: "#ef4444",
      },
    ];
  })();

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    }
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
                      grandTotal?: number;
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
                            {(order.grandTotal ?? order.totalPrice ?? 0).toFixed(2)}
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

          {/* Analytics Plots */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Orders by Status
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersByStatus}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {ordersByStatus.map((entry) => (
                        <Cell key={entry.status} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Revenue Trend (Last 7 Days)
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number | string | undefined) => {
                        const numeric = typeof value === "number" ? value : Number(value);
                        return `$${Number.isFinite(numeric) ? numeric.toFixed(2) : "0.00"}`;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Products by Quantity
              </h3>
              <div className="h-72">
                {topProducts.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="quantity" fill="#14b8a6" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-gray-500">
                    No product order activity yet.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Product Fabric Coverage
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fabricCoverage}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      {fabricCoverage.map((entry) => (
                        <Cell key={entry.label} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
