"use client";

import Link from "next/link";
import React, { useState } from "react";

import ConfirmDialog from "@/components/ConfirmDialog";
import { Button, Modal } from "@/components/ui";
import {
  useAssignProductionByOrderMutation,
  useCancelOrderWithRefundMutation,
  useDeleteOrderMutation,
  useGetAllDesignersQuery,
  useGetAllOrdersQuery,
  useGetAllProductionQueuesQuery,
} from "@/store/api";
import type { OrderResponseDTO } from "@/store/api/orderApi";
import type { ProductionQueue } from "@/store/api/productionApi";
import type { Designer } from "@/store/api/userApi";
import { showToast } from "@/utilities/toast";

import DataTable from "../_components/DataTable";
import PageHeader from "../_components/PageHeader";

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
  const [showAssignDesignerModal, setShowAssignDesignerModal] = useState(false);
  const [assignDesignerForm, setAssignDesignerForm] = useState({
    orderId: 0,
    assignedDesignerId: "",
    priority: "",
    notes: "",
  });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null);
  const [cancelRefundAmount, setCancelRefundAmount] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const { data: orders = [], isLoading, refetch } = useGetAllOrdersQuery();
  const { data: designers = [] } = useGetAllDesignersQuery();
  const { data: productionQueues = [] } = useGetAllProductionQueuesQuery();
  const [deleteOrder] = useDeleteOrderMutation();
  const [assignProductionByOrder] = useAssignProductionByOrderMutation();
  const [cancelOrderWithRefund, { isLoading: isCancelling }] = useCancelOrderWithRefundMutation();

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PARTIALLY_PAID":
        return "bg-orange-100 text-orange-800";
      case "PAID":
        return "bg-blue-100 text-blue-800";
      case "CONFIRMED":
        return "bg-indigo-100 text-indigo-800";
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800";
      case "READY_FOR_DELIVERY":
        return "bg-teal-100 text-teal-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canAssignDesigner = (status?: string) =>
    (status || "").toUpperCase() === "PAID";

  const canCancel = (status?: string) =>
    !["CANCELLED", "DELIVERED"].includes((status || "").toUpperCase());

  const openCancelModal = (orderId: number) => {
    setOrderToCancel(orderId);
    setCancelRefundAmount("");
    setCancelReason("");
    setShowCancelModal(true);
  };

  // A1: cancels and, if a refund amount is given, issues it in the same atomic call
  // (SOP_CANCELLATIONS.md) - leave the amount blank for a pre-payment cancellation with
  // nothing to refund.
  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    if (!cancelReason.trim()) {
      showToast.error("A reason is required for the audit record");
      return;
    }
    try {
      const result = await cancelOrderWithRefund({
        id: orderToCancel,
        refundAmount: cancelRefundAmount ? Number(cancelRefundAmount) : null,
        reason: cancelReason.trim(),
      }).unwrap();
      showToast.success(
        result.totalRefunded
          ? `Order cancelled - refunded $${result.totalRefunded.toFixed(2)}`
          : "Order cancelled"
      );
      setShowCancelModal(false);
      setOrderToCancel(null);
      refetch();
    } catch (err: any) {
      showToast.error(err?.data?.message || "Failed to cancel order");
    }
  };

  const productionQueueByOrderId = new Map<number, ProductionQueue>(
    productionQueues
      .filter((queue) => typeof queue.orderId === "number")
      .map((queue) => [queue.orderId, queue])
  );

  const getAssignedDesignerName = (orderId?: number) => {
    if (!orderId) {
      return "Unassigned";
    }

    const queue = productionQueueByOrderId.get(orderId);
    if (!queue?.assignedDesignerName) {
      return "Unassigned";
    }

    return queue.assignedDesignerName;
  };

  const getProductionStatus = (orderId?: number) => {
    if (!orderId) {
      return "Not queued";
    }

    return productionQueueByOrderId.get(orderId)?.status || "Not queued";
  };

  const openAssignDesignerModal = (orderId: number) => {
    setAssignDesignerForm({
      orderId,
      assignedDesignerId: "",
      priority: "",
      notes: "",
    });
    setShowAssignDesignerModal(true);
  };

  const handleAssignDesigner = async () => {
    if (!assignDesignerForm.orderId || !assignDesignerForm.assignedDesignerId) {
      showToast.error("Select a designer before assigning");
      return;
    }

    try {
      await assignProductionByOrder({
        orderId: assignDesignerForm.orderId,
        data: {
          assignedDesignerId: Number(assignDesignerForm.assignedDesignerId),
          priority: assignDesignerForm.priority
            ? Number(assignDesignerForm.priority)
            : undefined,
          notes: assignDesignerForm.notes.trim() || undefined,
        },
      }).unwrap();

      showToast.success("Designer assigned successfully");
      setShowAssignDesignerModal(false);
      setAssignDesignerForm({
        orderId: 0,
        assignedDesignerId: "",
        priority: "",
        notes: "",
      });
      refetch();
    } catch (error) {
      const err = error as { data?: { message?: string }; error?: string };
      showToast.error(
        err?.data?.message || err?.error || "Failed to assign designer"
      );
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
      } catch {
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
      header: "Qty",
      render: (_value: unknown, row: unknown) => {
        const orderRow = row as { items?: { quantity?: number }[] };
        const totalQty = (orderRow.items || []).reduce(
          (sum, item) => sum + (item.quantity || 1),
          0
        );
        return totalQty.toString();
      },
    },
    {
      key: "grandTotal",
      header: "Grand Total",
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
      key: "assignedDesigner",
      header: "Assigned Designer",
      render: (_value: unknown, row: unknown) => {
        const orderRow = row as { orderId?: number };
        const assignedDesignerName = getAssignedDesignerName(orderRow.orderId);

        return (
          <span
            className={
              assignedDesignerName === "Unassigned"
                ? "text-gray-500"
                : "text-gray-900"
            }
          >
            {assignedDesignerName}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (_value: unknown, row: unknown) => {
        const orderRow = row as { orderId: number; status?: string };
        return (
          <div className="flex gap-2">
            <Link
              href={`/orders/${orderRow.orderId}`}
              className="text-primary hover:text-primary-dark text-sm"
            >
              View
            </Link>
            {canAssignDesigner(orderRow.status) && (
              <button
                type="button"
                onClick={() => openAssignDesignerModal(orderRow.orderId)}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Assign Designer
              </button>
            )}
            {canCancel(orderRow.status) && (
              <button
                type="button"
                onClick={() => openCancelModal(orderRow.orderId)}
                className="text-orange-600 hover:text-orange-800 text-sm"
              >
                Cancel &amp; Refund
              </button>
            )}
            <button
              type="button"
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

  const filteredData = orders.filter((order: OrderResponseDTO) => {
    const matchesSearch =
      order.orderId?.toString().includes(searchTerm) ||
      order.customerUsername?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      !statusFilter ||
      order.status?.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      label: "Total Orders",
      value: orders.length.toString(),
    },
    {
      label: "Pending",
      value: orders
        .filter((o: OrderResponseDTO) => o.status === "PENDING")
        .length.toString(),
    },
    {
      label: "In Progress",
      value: orders
        .filter((o: OrderResponseDTO) => o.status === "IN_PROGRESS")
        .length.toString(),
    },
    {
      label: "Delivered",
      value: orders
        .filter((o: OrderResponseDTO) => o.status === "DELIVERED")
        .length.toString(),
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
                    "Grand Total",
                    "Status",
                    "Order Date",
                  ].join(","),
                  ...orders.map((o: OrderResponseDTO) =>
                    [
                      o.orderId,
                      o.customerUsername ?? o.customerId,
                      o.grandTotal,
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
        {stats.map((stat) => (
          <div
            key={stat.label}
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
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
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

      <Modal
        isOpen={showAssignDesignerModal}
        onClose={() => setShowAssignDesignerModal(false)}
        className="max-w-lg"
      >
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Assign Designer
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Assign a designer to order #{assignDesignerForm.orderId}. This
              will reuse the production queue created after payment approval.
            </p>
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Designer
            </p>
            <select
              id="assign-designer-id"
              aria-label="Designer"
              value={assignDesignerForm.assignedDesignerId}
              onChange={(e) =>
                setAssignDesignerForm((current) => ({
                  ...current,
                  assignedDesignerId: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a designer</option>
              {designers.map((designer: Designer) => (
                <option key={designer.designerId} value={designer.designerId}>
                  {designer.designerName}
                  {designer.user?.username
                    ? ` (${designer.user.username})`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </p>
            <input
              id="assign-designer-priority"
              aria-label="Priority"
              type="number"
              min="0"
              value={assignDesignerForm.priority}
              onChange={(e) =>
                setAssignDesignerForm((current) => ({
                  ...current,
                  priority: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Optional priority"
            />
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </p>
            <textarea
              id="assign-designer-notes"
              aria-label="Notes"
              value={assignDesignerForm.notes}
              onChange={(e) =>
                setAssignDesignerForm((current) => ({
                  ...current,
                  notes: e.target.value,
                }))
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              placeholder="Optional production notes"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAssignDesignerModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignDesigner}>Assign Designer</Button>
          </div>
        </div>
      </Modal>

      {/* Cancel & Refund Modal (A1: SOP_CANCELLATIONS.md) */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setOrderToCancel(null);
        }}
        className="max-w-lg"
      >
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Cancel Order #{orderToCancel}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Per SOP_CANCELLATIONS.md, refund tier depends on production stage.
              Leave the amount blank if nothing was paid or nothing should be
              refunded; otherwise enter the base amount - tax is added back
              automatically, proportional to that amount.
            </p>
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Base refund amount (optional)
            </p>
            <input
              type="number"
              min="0"
              step="0.01"
              value={cancelRefundAmount}
              onChange={(e) => setCancelRefundAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0.00 (leave blank for no refund)"
            />
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">
              Reason (recorded on the audit trail)
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Customer requested cancellation before fabric sourcing"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelModal(false);
                setOrderToCancel(null);
              }}
            >
              Back
            </Button>
            <Button onClick={handleCancelOrder} disabled={isCancelling}>
              {isCancelling ? "Cancelling..." : "Cancel Order"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrdersPage;
