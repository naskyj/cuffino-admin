"use client";

import React, { useState } from "react";

import ConfirmDialog from "@/components/ConfirmDialog";
import { Button, Modal } from "@/components/ui";
import {
  ProductionStatus,
  useAssignProductionMutation,
  useCreateProductionQueueMutation,
  useDeleteProductionQueueMutation,
  useGetAllProductionQueuesQuery,
  useUpdateProductionQueueMutation,
  useUpdateProductionStatusMutation,
} from "@/store/api";
import { showToast } from "@/utilities/toast";

import DataTable from "../_components/DataTable";
import PageHeader from "../_components/PageHeader";

const ProductionPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const {
    data: productionQueues = [],
    isLoading,
    error,
    refetch,
  } = useGetAllProductionQueuesQuery();
  const [createProduction] = useCreateProductionQueueMutation();
  const [updateProduction] = useUpdateProductionQueueMutation();
  const [deleteProduction] = useDeleteProductionQueueMutation();
  const [updateStatus] = useUpdateProductionStatusMutation();
  const [assignProduction] = useAssignProductionMutation();

  // Form states
  const [formData, setFormData] = useState({
    orderId: "",
    orderItemId: "",
    status: "QUEUED" as ProductionStatus,
    assignedDesignerId: "",
    priority: "",
    notes: "",
  });

  const getStatusColor = (status: ProductionStatus) => {
    switch (status) {
      case "QUEUED":
        return "bg-gray-100 text-gray-800";
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800";
      case "FABRIC_ACQUISITION":
        return "bg-yellow-100 text-yellow-800";
      case "IN_PRODUCTION":
        return "bg-purple-100 text-purple-800";
      case "QUALITY_CHECK":
        return "bg-orange-100 text-orange-800";
      case "READY_FOR_SHIPMENT":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAdd = async () => {
    try {
      await createProduction({
        orderId: Number(formData.orderId),
        orderItemId: formData.orderItemId
          ? Number(formData.orderItemId)
          : undefined,
        status: formData.status,
        assignedDesignerId: formData.assignedDesignerId
          ? Number(formData.assignedDesignerId)
          : undefined,
        priority: formData.priority ? Number(formData.priority) : undefined,
        notes: formData.notes || undefined,
      }).unwrap();
      setShowAddModal(false);
      resetForm();
      refetch();
    } catch (error) {
      showToast.error("Failed to create production queue item");
    }
  };

  const handleEdit = async () => {
    if (!selectedItem) return;
    try {
      await updateProduction({
        id: selectedItem.queueId,
        data: {
          orderId: Number(formData.orderId),
          orderItemId: formData.orderItemId
            ? Number(formData.orderItemId)
            : undefined,
          status: formData.status,
          assignedDesignerId: formData.assignedDesignerId
            ? Number(formData.assignedDesignerId)
            : undefined,
          priority: formData.priority ? Number(formData.priority) : undefined,
          notes: formData.notes || undefined,
        },
      }).unwrap();
      setShowEditModal(false);
      setSelectedItem(null);
      resetForm();
      refetch();
    } catch (error) {
      showToast.error("Failed to update production queue item");
    }
  };

  const handleDeleteClick = (queueId: number) => {
    setItemToDelete(queueId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        await deleteProduction(itemToDelete).unwrap();
        showToast.success("Production queue item deleted successfully");
        refetch();
        setShowDeleteDialog(false);
        setItemToDelete(null);
      } catch (error) {
        showToast.error("Failed to delete production queue item");
        setShowDeleteDialog(false);
        setItemToDelete(null);
      }
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedItem) return;
    try {
      await updateStatus({
        id: selectedItem.queueId,
        data: {
          status: formData.status,
          notes: formData.notes || undefined,
        },
      }).unwrap();
      setShowStatusModal(false);
      setSelectedItem(null);
      resetForm();
      refetch();
    } catch (error) {
      showToast.error("Failed to update status");
    }
  };

  const handleAssign = async () => {
    if (!selectedItem) return;
    try {
      await assignProduction({
        id: selectedItem.queueId,
        data: {
          assignedDesignerId: Number(formData.assignedDesignerId),
          priority: formData.priority ? Number(formData.priority) : undefined,
          notes: formData.notes || undefined,
        },
      }).unwrap();
      setShowAssignModal(false);
      setSelectedItem(null);
      resetForm();
      refetch();
    } catch (error) {
      showToast.error("Failed to assign production");
    }
  };

  const resetForm = () => {
    setFormData({
      orderId: "",
      orderItemId: "",
      status: "QUEUED",
      assignedDesignerId: "",
      priority: "",
      notes: "",
    });
  };

  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setFormData({
      orderId: item.orderId?.toString() || "",
      orderItemId: item.orderItemId?.toString() || "",
      status: item.status || "QUEUED",
      assignedDesignerId: item.assignedDesignerId?.toString() || "",
      priority: item.priority?.toString() || "",
      notes: item.notes || "",
    });
    setShowEditModal(true);
  };

  const openStatusModal = (item: any) => {
    setSelectedItem(item);
    setFormData({
      ...formData,
      status: item.status,
      notes: item.notes || "",
    });
    setShowStatusModal(true);
  };

  const openAssignModal = (item: any) => {
    setSelectedItem(item);
    setFormData({
      ...formData,
      assignedDesignerId: item.assignedDesignerId?.toString() || "",
      priority: item.priority?.toString() || "",
      notes: item.notes || "",
    });
    setShowAssignModal(true);
  };

  const handleExport = () => {
    const csv = [
      [
        "Queue ID",
        "Order ID",
        "Status",
        "Assigned Designer",
        "Priority",
        "Created At",
      ].join(","),
      ...productionQueues.map((q: any) =>
        [
          q.queueId,
          q.orderId,
          q.status,
          q.assignedDesignerId || "",
          q.priority || "",
          q.createdAt || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `production-queue-${new Date().toISOString()}.csv`;
    a.click();
  };

  const columns = [
    {
      key: "queueId",
      header: "Queue ID",
      className: "font-medium",
    },
    {
      key: "orderId",
      header: "Order ID",
    },
    {
      key: "status",
      header: "Status",
      render: (value: unknown) => {
        const statusValue = value as ProductionStatus;
        return (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
              statusValue
            )}`}
          >
            {String(statusValue).replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      key: "assignedDesignerId",
      header: "Designer ID",
      render: (value: unknown) => (value as number) || "Unassigned",
    },
    {
      key: "priority",
      header: "Priority",
      render: (value: unknown) => (value as number) || "N/A",
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
        const queueRow = row as { queueId: number };
        return (
          <div className="flex gap-2">
            <button
              onClick={() => openEditModal(row)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => openStatusModal(row)}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              Update Status
            </button>
            <button
              onClick={() => openAssignModal(row)}
              className="text-purple-600 hover:text-purple-800 text-sm"
            >
              Assign
            </button>
            <button
              onClick={() => handleDeleteClick(queueRow.queueId)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  const filteredData = productionQueues.filter((item: any) => {
    const matchesSearch =
      item.queueId?.toString().includes(searchTerm) ||
      item.orderId?.toString().includes(searchTerm);
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      label: "Total Items",
      value: productionQueues.length.toString(),
    },
    {
      label: "Queued",
      value: productionQueues
        .filter((q: any) => q.status === "QUEUED")
        .length.toString(),
    },
    {
      label: "In Production",
      value: productionQueues
        .filter((q: any) => q.status === "IN_PRODUCTION")
        .length.toString(),
    },
    {
      label: "Ready for Shipment",
      value: productionQueues
        .filter((q: any) => q.status === "READY_FOR_SHIPMENT")
        .length.toString(),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Production Queue"
        subtitle="Manage production queue and track manufacturing progress"
        actions={
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handleExport}>
              Export Data
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              Add to Queue
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
              placeholder="Search by queue ID or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Status</option>
              <option value="QUEUED">Queued</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="FABRIC_ACQUISITION">Fabric Acquisition</option>
              <option value="IN_PRODUCTION">In Production</option>
              <option value="QUALITY_CHECK">Quality Check</option>
              <option value="READY_FOR_SHIPMENT">Ready for Shipment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Production Queue Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-500">Loading production queue...</div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg border border-red-200 p-12 text-center">
          <div className="text-red-600 font-medium mb-2">
            Error loading production queue
          </div>
          <div className="text-sm text-gray-500">
            {error && "data" in error
              ? (error.data as any)?.message || "Failed to load data"
              : "Please try again"}
          </div>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Retry
          </button>
        </div>
      ) : productionQueues.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-500 mb-2">
            No production queue items found
          </div>
          <div className="text-sm text-gray-400">
            Click "Add to Queue" to create your first production queue item
          </div>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-500">No items match your filters</div>
          <div className="text-sm text-gray-400 mt-2">
            Showing {filteredData.length} of {productionQueues.length} items
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <DataTable
            data={filteredData}
            columns={columns}
            emptyMessage="No production queue items found"
            onRowClick={(row) => {
              console.log("Clicked production queue:", row);
            }}
          />
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        showCloseButton
        className="max-w-2xl"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Add to Production Queue
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID *
              </label>
              <input
                type="number"
                value={formData.orderId}
                onChange={(e) =>
                  setFormData({ ...formData, orderId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Item ID
                </label>
                <input
                  type="number"
                  value={formData.orderItemId}
                  onChange={(e) =>
                    setFormData({ ...formData, orderItemId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as ProductionStatus,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="QUEUED">Queued</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="FABRIC_ACQUISITION">Fabric Acquisition</option>
                  <option value="IN_PRODUCTION">In Production</option>
                  <option value="QUALITY_CHECK">Quality Check</option>
                  <option value="READY_FOR_SHIPMENT">Ready for Shipment</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Designer ID
                </label>
                <input
                  type="number"
                  value={formData.assignedDesignerId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assignedDesignerId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAdd}>Add to Queue</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Modal - Similar structure to Add Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedItem(null);
          resetForm();
        }}
        showCloseButton
        className="max-w-2xl"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Edit Production Queue Item
          </h2>
          <div className="space-y-4">
            {/* Same form fields as Add Modal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID *
              </label>
              <input
                type="number"
                value={formData.orderId}
                onChange={(e) =>
                  setFormData({ ...formData, orderId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Item ID
                </label>
                <input
                  type="number"
                  value={formData.orderItemId}
                  onChange={(e) =>
                    setFormData({ ...formData, orderItemId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as ProductionStatus,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="QUEUED">Queued</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="FABRIC_ACQUISITION">Fabric Acquisition</option>
                  <option value="IN_PRODUCTION">In Production</option>
                  <option value="QUALITY_CHECK">Quality Check</option>
                  <option value="READY_FOR_SHIPMENT">Ready for Shipment</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Designer ID
                </label>
                <input
                  type="number"
                  value={formData.assignedDesignerId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      assignedDesignerId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedItem(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEdit}>Update</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedItem(null);
          resetForm();
        }}
        showCloseButton
        className="max-w-md"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Update Status
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as ProductionStatus,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="QUEUED">Queued</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="FABRIC_ACQUISITION">Fabric Acquisition</option>
                <option value="IN_PRODUCTION">In Production</option>
                <option value="QUALITY_CHECK">Quality Check</option>
                <option value="READY_FOR_SHIPMENT">Ready for Shipment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedItem(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateStatus}>Update Status</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedItem(null);
          resetForm();
        }}
        showCloseButton
        className="max-w-md"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Assign Designer
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designer ID *
              </label>
              <input
                type="number"
                value={formData.assignedDesignerId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assignedDesignerId: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedItem(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAssign}>Assign</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Production Queue Item"
        message="Are you sure you want to delete this production queue item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false);
          setItemToDelete(null);
        }}
        variant="danger"
      />
    </div>
  );
};

export default ProductionPage;
