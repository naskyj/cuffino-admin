"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";
import ConfirmDialog from "@/components/ConfirmDialog";
import { showToast } from "@/utilities/toast";
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} from "@/store/api";
import DataTable from "../_components/DataTable";
import PageHeader from "../_components/PageHeader";

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);

  const { data: orders = [], isLoading, refetch } = useGetAllOrdersQuery();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();
  const [deleteOrder] = useDeleteOrderMutation();

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PAID":
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus({
        id: orderId,
        status: newStatus as any,
      }).unwrap();
      refetch();
    } catch (error) {
      showToast.error("Failed to update order status");
    }
  };

  const handleDeleteClick = (orderId: number) => {
    setOrderToDelete(orderId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (orderToDelete) {
      try {
        await deleteOrder(orderToDelete).unwrap();
        showToast.success("Order deleted successfully");
        refetch();
        setShowDeleteDialog(false);
        setOrderToDelete(null);
      } catch (error) {
        showToast.error("Failed to delete order");
        setShowDeleteDialog(false);
        setOrderToDelete(null);
      }
    }
  };

  const columns = [
    {
      key: "orderId",
      header: "Order ID",
      className: "font-medium",
    },
    {
      key: "customerUsername",
      header: "Customer",
      render: (value: unknown) => (value as string) || "N/A",
    },
    {
      key: "items",
      header: "Items",
      render: (_value: unknown, row: unknown) => {
        const orderRow = row as { items?: unknown[] };
        return orderRow.items?.length?.toString() || "0";
      },
    },
    {
      key: "totalPrice",
      header: "Total",
      render: (value: unknown) => `$${(value as number)?.toFixed(2) || "0.00"}`,
    },
    {
      key: "orderDate",
      header: "Date",
      render: (value: unknown) =>
        value ? new Date(value as string).toLocaleDateString() : "N/A",
    },
    {
      key: "status",
      header: "Status",
      render: (value: unknown) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
            String(value || "")
          )}`}
        >
          {String(value || "").toUpperCase() || "PENDING"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_value: unknown, row: unknown) => {
        const orderRow = row as { orderId: number; status?: string };
        return (
          <div className="flex gap-2">
            <button className="text-primary hover:text-primary-dark text-sm">
              View
            </button>
            <select
              value={orderRow.status || "PENDING"}
              onChange={(e) => handleStatusUpdate(orderRow.orderId, e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button
              onClick={() => handleDeleteClick(orderRow.orderId)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  const filteredData = orders.filter((order: any) => {
    const matchesSearch =
      order.orderId?.toString().includes(searchTerm) ||
      order.customerUsername?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      !statusFilter || order.status?.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      label: "Total Orders",
      value: orders.length.toString(),
    },
    {
      label: "Pending",
      value: orders.filter((o: any) => o.status === "PENDING").length.toString(),
    },
    {
      label: "Processing",
      value: orders.filter((o: any) => o.status === "PROCESSING").length.toString(),
    },
    {
      label: "Delivered",
      value: orders.filter((o: any) => o.status === "DELIVERED").length.toString(),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Orders"
        subtitle="Manage customer orders and track their status"
        actions={
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const csv = [
                  [
                    "Order ID",
                    "Customer",
                    "Total Price",
                    "Status",
                    "Order Date",
                  ].join(","),
                  ...orders.map((o: any) =>
                    [
                      o.orderId,
                      o.customerUsername || o.customerId,
                      o.totalPrice,
                      o.status,
                      o.orderDate,
                    ].join(",")
                  ),
                ].join("\n");

                const blob = new Blob([csv], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `orders-${new Date().toISOString()}.csv`;
                a.click();
              }}
            >
              Export Orders
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
              placeholder="Search by order ID or customer..."
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
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-500">Loading orders...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <DataTable
            data={filteredData}
            columns={columns}
            emptyMessage="No orders found"
            onRowClick={(row) => {
              console.log("Clicked order:", row);
            }}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false);
          setOrderToDelete(null);
        }}
        variant="danger"
      />
    </div>
  );
};

export default OrdersPage;
