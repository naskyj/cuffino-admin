"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";
import DataTable from "../_components/DataTable";
import PageHeader from "../_components/PageHeader";

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  date: string;
  items: number;
}

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - in real app, this would come from API
  const ordersData: Order[] = [
    {
      id: "1",
      orderNumber: "ORD-001",
      customer: "John Doe",
      status: "delivered",
      total: 299.99,
      date: "2024-01-10",
      items: 3,
    },
    {
      id: "2",
      orderNumber: "ORD-002",
      customer: "Jane Smith",
      status: "processing",
      total: 149.50,
      date: "2024-01-12",
      items: 2,
    },
    {
      id: "3",
      orderNumber: "ORD-003",
      customer: "Bob Johnson",
      status: "shipped",
      total: 89.99,
      date: "2024-01-11",
      items: 1,
    },
    {
      id: "4",
      orderNumber: "ORD-004",
      customer: "Alice Brown",
      status: "pending",
      total: 459.99,
      date: "2024-01-13",
      items: 5,
    },
    {
      id: "5",
      orderNumber: "ORD-005",
      customer: "Charlie Wilson",
      status: "cancelled",
      total: 199.99,
      date: "2024-01-09",
      items: 2,
    },
  ];

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    {
      key: "orderNumber",
      header: "Order Number",
      className: "font-medium",
    },
    {
      key: "customer",
      header: "Customer",
    },
    {
      key: "items",
      header: "Items",
    },
    {
      key: "total",
      header: "Total",
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: "date",
      header: "Date",
    },
    {
      key: "status",
      header: "Status",
      render: (value: Order["status"]) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
            value
          )}`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_: never, row: Order) => (
        <div className="flex gap-2">
          <button className="text-primary hover:text-primary-dark text-sm">
            View
          </button>
          <button className="text-gray-600 hover:text-gray-800 text-sm">
            Edit
          </button>
        </div>
      ),
    },
  ];

  const filteredData = ordersData.filter((order) =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: "Total Orders", value: ordersData.length.toString() },
    { label: "Pending", value: ordersData.filter(o => o.status === "pending").length.toString() },
    { label: "Processing", value: ordersData.filter(o => o.status === "processing").length.toString() },
    { label: "Delivered", value: ordersData.filter(o => o.status === "delivered").length.toString() },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        subtitle="Manage customer orders and track their status"
        actions={
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              Export Orders
            </Button>
            <Button size="sm">Create Order</Button>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by order number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Date Range</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={filteredData}
          columns={columns}
          emptyMessage="No orders found"
          onRowClick={(row) => {
            // Handle row click - could navigate to order detail
            console.log("Clicked order:", row);
          }}
        />
      </div>
    </div>
  );
};

export default OrdersPage;

