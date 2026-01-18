"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";
import { useGetAllOrdersQuery } from "@/store/api";
import DataTable from "../_components/DataTable";
import PageHeader from "../_components/PageHeader";

const PaymentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: orders = [], isLoading } = useGetAllOrdersQuery();

  // Extract payment information from orders
  // Since OrderResponseDTO doesn't include payments, we'll derive payment info from order status and totals
  // For orders with status PAID or higher, we assume payment was made
  const paymentsData = orders
    .filter((order: any) => 
      order.status === "PAID" || 
      order.status === "PROCESSING" || 
      order.status === "SHIPPED" || 
      order.status === "DELIVERED"
    )
    .map((order: any) => ({
      transactionId: `ORD-${order.orderId}`,
      orderId: order.orderId,
      customer: order.customerUsername || `User ${order.customerId}`,
      amountPaid: order.finalizedTotal || order.totalPrice + order.tax + order.shippingFee - order.discountTotal,
      paymentMethod: "CARD", // Default since we don't have this info
      paymentStatus: order.status === "PAID" || order.status === "PROCESSING" || order.status === "SHIPPED" || order.status === "DELIVERED" 
        ? "SUCCEEDED" 
        : "PENDING",
      paymentDate: order.orderDate || new Date().toISOString(),
    }));

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCEEDED":
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method?.toUpperCase()) {
      case "CARD":
        return "💳";
      case "PAYPAL":
        return "🅿️";
      case "BANK_TRANSFER":
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
      render: (value: unknown) => (value as string) || "N/A",
    },
    {
      key: "customer",
      header: "Customer",
      render: (value: unknown) => (value as string) || "N/A",
    },
    {
      key: "amountPaid",
      header: "Amount",
      render: (value: unknown) => `$${(value as number)?.toFixed(2) || "0.00"}`,
    },
    {
      key: "paymentMethod",
      header: "Method",
      render: (value: unknown) => {
        const methodValue = String(value || "");
        return (
          <div className="flex items-center gap-2">
            <span>{getMethodIcon(methodValue)}</span>
            <span className="capitalize">{methodValue?.replace("_", " ") || "N/A"}</span>
          </div>
        );
      },
    },
    {
      key: "paymentStatus",
      header: "Status",
      render: (value: unknown) => {
        const statusValue = String(value || "");
        return (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
              statusValue
            )}`}
          >
            {statusValue?.toUpperCase() || "PENDING"}
          </span>
        );
      },
    },
    {
      key: "paymentDate",
      header: "Date",
      render: (value: unknown) =>
        value ? new Date(value as string).toLocaleDateString() : "N/A",
    },
    {
      key: "orderId",
      header: "Order ID",
      render: (value: unknown) => (value as number)?.toString() || "N/A",
    },
  ];

  const filteredData = paymentsData.filter((payment: any) => {
    const matchesSearch =
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderId?.toString().includes(searchTerm);
    const matchesStatus =
      !statusFilter ||
      payment.paymentStatus?.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = paymentsData
    .filter((p: any) => p.paymentStatus === "SUCCEEDED" || p.paymentStatus === "COMPLETED")
    .reduce((sum: number, p: any) => sum + (p.amountPaid || 0), 0);

  const stats = [
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
    },
    {
      label: "Completed",
      value: paymentsData.filter(
        (p: any) => p.paymentStatus === "SUCCEEDED" || p.paymentStatus === "COMPLETED"
      ).length.toString(),
    },
    {
      label: "Pending",
      value: paymentsData.filter((p: any) => p.paymentStatus === "PENDING").length.toString(),
    },
    {
      label: "Failed",
      value: paymentsData.filter((p: any) => p.paymentStatus === "FAILED").length.toString(),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Manage payment transactions and financial records"
        actions={
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const csv = [
                  [
                    "Transaction ID",
                    "Customer",
                    "Amount",
                    "Payment Method",
                    "Status",
                    "Order ID",
                    "Date",
                  ].join(","),
                  ...paymentsData.map((p: any) =>
                    [
                      p.transactionId || "",
                      p.customer || "",
                      p.amountPaid || 0,
                      p.paymentMethod || "",
                      p.paymentStatus || "",
                      p.orderId || "",
                      p.paymentDate || "",
                    ].join(",")
                  ),
                ].join("\n");

                const blob = new Blob([csv], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `payments-${new Date().toISOString()}.csv`;
                a.click();
              }}
            >
              Export Report
            </Button>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Status</option>
              <option value="SUCCEEDED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-500">Loading payments...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <DataTable
            data={filteredData}
            columns={columns}
            emptyMessage="No payment records found"
            onRowClick={(row) => {
              console.log("Clicked payment:", row);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
