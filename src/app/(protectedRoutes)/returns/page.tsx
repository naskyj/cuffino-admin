"use client";

import React, { useState } from "react";
import { Button, Modal } from "@/components/ui";
import { showToast } from "@/utilities/toast";
import {
  useGetAllOrdersQuery,
  useGetReturnsByOrderQuery,
  useUpdateReturnStatusMutation,
  ReturnStatus,
} from "@/store/api";
import DataTable from "../_components/DataTable";
import PageHeader from "../_components/PageHeader";

const ReturnsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<ReturnStatus>("PENDING");
  const [resolution, setResolution] = useState("");

  const { data: orders = [] } = useGetAllOrdersQuery();
  const { data: returns = [], isLoading, refetch } = useGetReturnsByOrderQuery(
    selectedOrderId!,
    { skip: !selectedOrderId }
  );
  const [updateReturnStatus] = useUpdateReturnStatusMutation();

  // Fetch returns for all orders when no specific order is selected
  // Note: This is a workaround since there's no "get all returns" endpoint
  // In production, you might want to add that endpoint to the backend
  React.useEffect(() => {
    if (!selectedOrderId && orders.length > 0) {
      // Set first order as default to show some returns
      setSelectedOrderId(orders[0]?.orderId || null);
    }
  }, [orders, selectedOrderId]);

  const getStatusColor = (status: ReturnStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-blue-100 text-blue-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "RECEIVED":
        return "bg-purple-100 text-purple-800";
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
        resolution: resolution || undefined,
      }).unwrap();
      setShowStatusModal(false);
      setSelectedReturn(null);
      setResolution("");
      refetch();
    } catch (error) {
      showToast.error("Failed to update return status");
    }
  };

  const handleExport = () => {
    // Export functionality
    const csv = [
      ["Return ID", "Order ID", "Reason", "Status", "Created At"].join(","),
      ...returns.map((r: any) =>
        [
          r.returnId,
          r.orderId,
          r.reason,
          r.status,
          r.createdAt,
        ].join(",")
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
    },
    {
      key: "reason",
      header: "Reason",
    },
    {
      key: "status",
      header: "Status",
      render: (value: unknown) => {
        const statusValue = value as ReturnStatus;
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
        const returnRow = row as { returnId: number; status: string };
        return (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedReturn(row);
                setNewStatus(returnRow.status as ReturnStatus);
                setShowStatusModal(true);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Update Status
            </button>
          </div>
        );
      },
    },
  ];

  const filteredData = returns.filter((ret: any) => {
    const matchesSearch =
      ret.returnId?.toString().includes(searchTerm) ||
      ret.orderId?.toString().includes(searchTerm) ||
      ret.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || ret.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      label: "Total Returns",
      value: returns.length.toString(),
    },
    {
      label: "Pending",
      value: returns.filter((r: any) => r.status === "PENDING").length.toString(),
    },
    {
      label: "Approved",
      value: returns.filter((r: any) => r.status === "APPROVED").length.toString(),
    },
    {
      label: "Refunded",
      value: returns.filter((r: any) => r.status === "REFUNDED").length.toString(),
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
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="RECEIVED">Received</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <select
              value={selectedOrderId || ""}
              onChange={(e) => setSelectedOrderId(Number(e.target.value) || null)}
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
          setResolution("");
        }}
        showCloseButton={true}
        className="max-w-md"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Update Return Status
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ReturnStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="RECEIVED">Received</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Notes (Optional)
              </label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add resolution notes..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedReturn(null);
                  setResolution("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateStatus}>Update Status</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReturnsPage;
