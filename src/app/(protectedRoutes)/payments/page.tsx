"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";
import DataTable from "../_components/DataTable";
import PageHeader from "../_components/PageHeader";

interface Payment {
  id: string;
  transactionId: string;
  customer: string;
  amount: number;
  method: "credit_card" | "debit_card" | "paypal" | "bank_transfer";
  status: "completed" | "pending" | "failed" | "refunded";
  date: string;
  orderId?: string;
}

const PaymentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - in real app, this would come from API
  const paymentsData: Payment[] = [
    {
      id: "1",
      transactionId: "TXN-001234",
      customer: "John Doe",
      amount: 299.99,
      method: "credit_card",
      status: "completed",
      date: "2024-01-10",
      orderId: "ORD-001",
    },
    {
      id: "2",
      transactionId: "TXN-001235",
      customer: "Jane Smith",
      amount: 149.50,
      method: "paypal",
      status: "completed",
      date: "2024-01-12",
      orderId: "ORD-002",
    },
    {
      id: "3",
      transactionId: "TXN-001236",
      customer: "Bob Johnson",
      amount: 89.99,
      method: "debit_card",
      status: "pending",
      date: "2024-01-11",
    },
    {
      id: "4",
      transactionId: "TXN-001237",
      customer: "Alice Brown",
      amount: 459.99,
      method: "credit_card",
      status: "failed",
      date: "2024-01-13",
      orderId: "ORD-004",
    },
    {
      id: "5",
      transactionId: "TXN-001238",
      customer: "Charlie Wilson",
      amount: 199.99,
      method: "bank_transfer",
      status: "refunded",
      date: "2024-01-09",
      orderId: "ORD-005",
    },
  ];

  const getStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMethodIcon = (method: Payment["method"]) => {
    switch (method) {
      case "credit_card":
        return "💳";
      case "debit_card":
        return "💳";
      case "paypal":
        return "🅿️";
      case "bank_transfer":
        return "🏦";
      default:
        return "💰";
    }
  };

  const columns = [
    {
      key: "transactionId",
      header: "Transaction ID",
      className: "font-medium",
    },
    {
      key: "customer",
      header: "Customer",
    },
    {
      key: "amount",
      header: "Amount",
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: "method",
      header: "Method",
      render: (value: Payment["method"]) => (
        <div className="flex items-center gap-2">
          <span>{getMethodIcon(value)}</span>
          <span className="capitalize">{value.replace("_", " ")}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value: Payment["status"]) => (
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
      key: "date",
      header: "Date",
    },
    {
      key: "orderId",
      header: "Order ID",
      render: (value?: string) => value || "N/A",
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row: Payment) => (
        <div className="flex gap-2">
          <button className="text-primary hover:text-primary-dark text-sm">
            View
          </button>
          {row.status === "completed" && (
            <button className="text-orange-600 hover:text-orange-800 text-sm">
              Refund
            </button>
          )}
        </div>
      ),
    },
  ];

  const filteredData = paymentsData.filter((payment) =>
    payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (payment.orderId && payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalRevenue = paymentsData
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}` },
    { label: "Completed", value: paymentsData.filter(p => p.status === "completed").length.toString() },
    { label: "Pending", value: paymentsData.filter(p => p.status === "pending").length.toString() },
    { label: "Failed", value: paymentsData.filter(p => p.status === "failed").length.toString() },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Manage payment transactions and financial records"
        actions={
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              Export Report
            </Button>
            <Button size="sm">Process Refund</Button>
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
              placeholder="Search by transaction ID, customer, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">All Methods</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={filteredData}
          columns={columns}
          emptyMessage="No payment records found"
          onRowClick={(row) => {
            // Handle row click - could navigate to payment detail
            console.log("Clicked payment:", row);
          }}
        />
      </div>
    </div>
  );
};

export default PaymentsPage;
