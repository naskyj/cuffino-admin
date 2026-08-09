"use client";

import React, { useState } from "react";

import { Button, Modal } from "@/components/ui";
import {
  ReturnStatus,
  useGetAllReturnsQuery,
  useGetAllOrdersQuery,
  useUpdateReturnStatusMutation,
  useRefundReturnMutation,
} from "@/store/api";
import { isAdminRole } from "@/utilities";
import { showToast } from "@/utilities/toast";

import DataTable from "../_components/DataTable";
import PageHeader from "../_components/PageHeader";

const ReturnsPage = () => {
  // PUT /returns/{id}/status is ADMIN-or-order-owner on the backend (not MANAGER) - hiding
  // this for Manager avoids showing a control that would just 403. Refund IS available to
  // MANAGER on the backend, so it stays visible to both roles.
  const isAdmin = isAdminRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<ReturnStatus>("REQUESTED");
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const { data: orders = [] } = useGetAllOrdersQuery();
  const { data: returns = [], isLoading, refetch } = useGetAllReturnsQuery();
  const [updateReturnStatus] = useUpdateReturnStatusMutation();
  const [refundReturn, { isLoading: isRefunding }] = useRefundReturnMutation();

  const getOrderId = (returnRequest: any) =>
    returnRequest.orderId ?? returnRequest.order?.orderId ?? null;

  const getNormalizedStatus = (status: string): ReturnStatus => {
    return (status as ReturnStatus) || "REQUESTED";
  };

  const getStatusColor = (status: ReturnStatus) => {
    switch (status) {
      case "REQUESTED":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-blue-100 text-blue-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "RECEIVED":
        return "bg-purple-100 text-purple-800";
      case "INSPECTED":
        return "bg-indigo-100 text-indigo-800";
      case "REWORK":
        return "bg-orange-100 text-orange-800";
      case "REFUNDED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedReturn) return;
    try {
      await updateReturnStatus({
        returnId: selectedReturn.returnId,
        status: newStatus,
      }).unwrap();
      setShowStatusModal(false);
      setSelectedReturn(null);
      refetch();
    } catch {
      showToast.error("Failed to update return status");
    }
  };

  // A1/G2: issues the refund directly against the order's payment (tax added proportionally by
  // the backend) and moves the return to REFUNDED - replaces the old "go do it in Stripe, then
  // remember to update this record" manual process.
  const handleRefund = async () => {
    if (!selectedReturn) return;
    const amount = Number(refundAmount);
    if (!amount || amount <= 0) {
      showToast.error("Enter a valid refund amount");
      return;
    }
    if (!refundReason.trim()) {
      showToast.error("A reason is required for the audit record");
      return;
    }
    try {
      await refundReturn({
        returnId: selectedReturn.returnId,
        amount,
        reason: refundReason.trim(),
      }).unwrap();
      showToast.success("Refund issued");
      setShowRefundModal(false);
      setSelectedReturn(null);
      setRefundAmount("");
      setRefundReason("");
      refetch();
    } catch (err: any) {
      showToast.error(err?.data?.message || "Failed to issue refund");
    }
  };

  const handleExport = () => {
    // Export functionality
    const csv = [
      ["Return ID", "Order ID", "Reason", "Status", "Created At"].join(","),
      ...returns.map((r: any) =>
        [r.returnId, getOrderId(r) || "", r.reason, r.status, r.createdAt].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `returns-${new Date().toISOString()}.csv`;
    a.click();
  };

  const columns = [
    {
      key: "returnId",
      header: "Return ID",
      className: "font-medium",
    },
    {
      key: "orderId",
      header: "Order ID",
      render: (_value: unknown, row: unknown) => {
        const returnRow = row as any;
        return getOrderId(returnRow) || "N/A";
      },
    },
    {
      key: "reason",
      header: "Reason",
    },
    {
      key: "status",
      header: "Status",
      render: (value: unknown) => {
        const statusValue = getNormalizedStatus(String(value || "REQUESTED"));
        return (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
              statusValue
            )}`}
          >
            {String(statusValue)}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (value: unknown) =>
        value ? new Date(value as string).toLocaleDateString() : "N/A",
    },
    {
      key: "actions",
      header: "Actions",
      render: (_value: unknown, row: unknown) => {
        const returnRow = row as {
          returnId: number;
          status: string;
          refundAmount?: number;
        };
        const isRefunded =
          getNormalizedStatus(returnRow.status) === "REFUNDED" ||
          getNormalizedStatus(returnRow.status) === "REJECTED";
        return (
          <div className="flex gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setSelectedReturn(row);
                  setNewStatus(getNormalizedStatus(returnRow.status));
                  setShowStatusModal(true);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Update Status
              </button>
            )}
            {!isRefunded && (
              <button
                type="button"
                onClick={() => {
                  setSelectedReturn(row);
                  setRefundAmount("");
                  setRefundReason("");
                  setShowRefundModal(true);
                }}
                className="text-green-700 hover:text-green-900 text-sm"
              >
                Refund
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const filteredData = returns.filter((ret: any) => {
    const matchesSearch =
      ret.returnId?.toString().includes(searchTerm) ||
      getOrderId(ret)?.toString().includes(searchTerm) ||
      ret.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      !statusFilter || getNormalizedStatus(ret.status) === statusFilter;
    const matchesOrder = !selectedOrderId || getOrderId(ret) === selectedOrderId;
    return matchesSearch && matchesStatus && matchesOrder;
  });

  const stats = [
    {
      label: "Total Returns",
      value: returns.length.toString(),
    },
    {
      label: "Pending",
      value: returns
        .filter((r: any) => r.status === "REQUESTED")
        .length.toString(),
    },
    {
      label: "Approved",
      value: returns
        .filter((r: any) => r.status === "APPROVED")
        .length.toString(),
    },
    {
      label: "Refunded",
      value: returns
        .filter((r: any) => r.status === "REFUNDED")
        .length.toString(),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Returns"
        subtitle="Manage customer return requests"
        actions={
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handleExport}>
              Export Returns
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
              placeholder="Search by return ID, order ID, or reason..."
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
              <option value="REQUESTED">Requested</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="RECEIVED">Received</option>
              <option value="INSPECTED">Inspected</option>
              <option value="REWORK">Rework</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <select
              value={selectedOrderId || ""}
              onChange={(e) =>
                setSelectedOrderId(Number(e.target.value) || null)
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Orders</option>
              {orders.map((order: any) => (
                <option key={order.orderId} value={order.orderId}>
                  Order #{order.orderId}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Returns Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-500">Loading returns...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <DataTable
            data={filteredData}
            columns={columns}
            emptyMessage="No returns found"
            onRowClick={(row) => {
              console.log("Clicked return:", row);
            }}
          />
        </div>
      )}

      {/* Update Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedReturn(null);
        }}
        showCloseButton
        className="max-w-md"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Update Return Status
          </h2>
          <div className="space-y-4">
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </p>
              <select
                aria-label="Return status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ReturnStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="REQUESTED">Requested</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="RECEIVED">Received</option>
                <option value="INSPECTED">Inspected</option>
                <option value="REWORK">Rework</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedReturn(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateStatus}>Update Status</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Refund Modal (A1/G2) */}
      <Modal
        isOpen={showRefundModal}
        onClose={() => {
          setShowRefundModal(false);
          setSelectedReturn(null);
        }}
        showCloseButton
        className="max-w-md"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Issue Refund</h2>
          <p className="text-sm text-gray-500 mb-4">
            Return #{selectedReturn?.returnId} &middot; Order #
            {selectedReturn ? getOrderId(selectedReturn) : ""}. Tax is refunded
            automatically, proportional to this base amount vs. the order total.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base refund amount (before tax)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (recorded on the audit trail)
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="e.g. Quality defect confirmed against pre-ship QC photos"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRefundModal(false);
                  setSelectedReturn(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleRefund} disabled={isRefunding}>
                {isRefunding ? "Issuing..." : "Issue Refund"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReturnsPage;
