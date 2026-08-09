/* eslint-disable jsx-a11y/label-has-associated-control */

"use client";

import React, { useState } from "react";

import ConfirmDialog from "@/components/ConfirmDialog";
import { Button, Modal } from "@/components/ui";
import {
  useCreateLogisticsMutation,
  useDeleteLogisticsMutation,
  useGetAllLogisticsQuery,
  useGetAllOrdersQuery,
  useUpdateLogisticsMutation,
} from "@/store/api";
import { isAdminRole } from "@/utilities";
import { showToast } from "@/utilities/toast";

import DataTable from "../_components/DataTable";
import PageHeader from "../_components/PageHeader";

const LogisticsPage = () => {
  const canDelete = isAdminRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const {
    data: logistics = [],
    isLoading,
    refetch,
  } = useGetAllLogisticsQuery();
  const { data: orders = [] } = useGetAllOrdersQuery();
  const [deleteLogistics] = useDeleteLogisticsMutation();
  const [updateLogistics] = useUpdateLogisticsMutation();
  const [createLogistics] = useCreateLogisticsMutation();

  const [formData, setFormData] = useState({
    orderId: "",
    shipmentDate: "",
    origin: "",
    destination: "",
    deliveryDate: "",
    carrier: "",
    trackingNumber: "",
    packageWeight: "",
    packageDimensions: "",
    customsDocUrl: "",
    statusUpdate: "",
  });

  const toDateInput = (value?: string) => (value ? value.slice(0, 10) : "");
  const toDateTimeValue = (value?: string) =>
    value ? `${value}T00:00:00` : undefined;
  const isAwaitingShipmentDetails = (item: any) => {
    const hasTrackingUpdates = (item.trackingUpdates?.length || 0) > 0;
    const hasCarrier = !!item.carrier?.trim();
    const hasTrackingNumber = !!item.trackingNumber?.trim();

    return (
      !hasTrackingUpdates &&
      !hasCarrier &&
      !hasTrackingNumber &&
      (item.shipmentStatus || "").toUpperCase() === "PENDING"
    );
  };

  const getLatestStatus = (item: any) =>
    isAwaitingShipmentDetails(item)
      ? "AWAITING_SHIPMENT_DETAILS"
      :
    item.trackingUpdates?.[item.trackingUpdates.length - 1]?.statusUpdate ||
    "NO_UPDATE";

  const resetForm = () => {
    setFormData({
      orderId: "",
      shipmentDate: "",
      origin: "",
      destination: "",
      deliveryDate: "",
      carrier: "",
      trackingNumber: "",
      packageWeight: "",
      packageDimensions: "",
      customsDocUrl: "",
      statusUpdate: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "AWAITING_SHIPMENT_DETAILS":
        return "bg-orange-100 text-orange-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "IN_TRANSIT":
      case "IN-TRANSIT":
        return "bg-blue-100 text-blue-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "DELAYED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const handleDeleteClick = (logisticsId: number) => {
    setItemToDelete(logisticsId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        await deleteLogistics(itemToDelete).unwrap();
        showToast.success("Logistics entry deleted successfully");
        refetch();
        setShowDeleteDialog(false);
        setItemToDelete(null);
      } catch {
        showToast.error("Failed to delete logistics entry");
        setShowDeleteDialog(false);
        setItemToDelete(null);
      }
    }
  };

  const handleAdd = async () => {
    try {
      await createLogistics({
        orderId: Number(formData.orderId),
        shipmentDate: toDateTimeValue(formData.shipmentDate),
        origin: formData.origin || undefined,
        destination: formData.destination || undefined,
        deliveryDate: toDateTimeValue(formData.deliveryDate),
        carrier: formData.carrier,
        trackingNumber: formData.trackingNumber,
        packageWeight: formData.packageWeight
          ? Number(formData.packageWeight)
          : undefined,
        packageDimensions: formData.packageDimensions || undefined,
        customsDocUrl: formData.customsDocUrl || undefined,
        trackingUpdates: formData.statusUpdate
          ? [
              {
                statusUpdate: formData.statusUpdate,
                updateTime: new Date().toISOString(),
              },
            ]
          : undefined,
      }).unwrap();
      setShowAddModal(false);
      resetForm();
      refetch();
    } catch {
      showToast.error("Failed to create logistics entry");
    }
  };

  const handleEdit = async () => {
    if (!selectedItem) return;
    try {
      await updateLogistics({
        id: selectedItem.logisticsId,
        data: {
          orderId: Number(formData.orderId),
          shipmentDate: toDateTimeValue(formData.shipmentDate),
          origin: formData.origin || undefined,
          destination: formData.destination || undefined,
          deliveryDate: toDateTimeValue(formData.deliveryDate),
          carrier: formData.carrier,
          trackingNumber: formData.trackingNumber,
          packageWeight: formData.packageWeight
            ? Number(formData.packageWeight)
            : undefined,
          packageDimensions: formData.packageDimensions || undefined,
          customsDocUrl: formData.customsDocUrl || undefined,
          trackingUpdates: formData.statusUpdate
            ? [
                {
                  statusUpdate: formData.statusUpdate,
                  updateTime: new Date().toISOString(),
                },
              ]
            : undefined,
        },
      }).unwrap();
      setShowEditModal(false);
      setSelectedItem(null);
      resetForm();
      refetch();
    } catch {
      showToast.error("Failed to update logistics entry");
    }
  };

  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setFormData({
      orderId: (item.orderId || item.order?.orderId)?.toString() || "",
      shipmentDate: toDateInput(item.shipmentDate),
      origin: item.origin || "",
      destination: item.destination || "",
      deliveryDate: toDateInput(item.deliveryDate),
      carrier: item.carrier || "",
      trackingNumber: item.trackingNumber || "",
      packageWeight: item.packageWeight?.toString() || "",
      packageDimensions: item.packageDimensions || "",
      customsDocUrl: item.customsDocUrl || "",
      statusUpdate: getLatestStatus(item) === "NO_UPDATE" ? "" : getLatestStatus(item),
    });
    setShowEditModal(true);
  };

  const handleExport = () => {
    const csv = [
      [
        "Logistics ID",
        "Order ID",
        "Tracking Number",
        "Carrier",
        "Status",
        "Location",
        "Est. Delivery",
      ].join(","),
      ...logistics.map((l: any) =>
        [
          l.logisticsId,
          l.orderId || l.order?.orderId || "",
          l.trackingNumber,
          l.carrier,
          getLatestStatus(l),
          l.destination || "",
          l.deliveryDate || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logistics-${new Date().toISOString()}.csv`;
    a.click();
  };

  const columns = [
    {
      key: "trackingNumber",
      header: "Tracking Number",
      className: "font-medium",
    },
    {
      key: "orderId",
      header: "Order ID",
      render: (_value: unknown, row: unknown) => {
        const logisticsRow = row as any;
        return logisticsRow.orderId || logisticsRow.order?.orderId || "N/A";
      },
    },
    {
      key: "carrier",
      header: "Carrier",
    },
    {
      key: "status",
      header: "Status",
      render: (_value: unknown, row: unknown) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
            getLatestStatus(row)
          )}`}
        >
          {getLatestStatus(row).replaceAll("_", " ").toUpperCase()}
        </span>
      ),
    },
    {
      key: "shipmentStatus",
      header: "Shipment",
      render: (_value: unknown, row: unknown) => {
        const logisticsRow = row as any;
        if (isAwaitingShipmentDetails(logisticsRow)) {
          return (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
              Awaiting Details
            </span>
          );
        }

        return (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
            {(logisticsRow.shipmentStatus || "N/A")
              .toString()
              .replaceAll("_", " ")
              .toUpperCase()}
          </span>
        );
      },
    },
    {
      key: "destination",
      header: "Destination",
      render: (value: unknown) => (value as string) || "N/A",
    },
    {
      key: "deliveryDate",
      header: "Est. Delivery",
      render: (value: unknown) =>
        value ? new Date(value as string).toLocaleDateString() : "N/A",
    },
    {
      key: "actions",
      header: "Actions",
      render: (_value: unknown, row: unknown) => {
        const logisticsRow = row as { logisticsId: number };
        return (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => openEditModal(row)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit
            </button>
            {canDelete && (
              <button
                type="button"
                onClick={() => handleDeleteClick(logisticsRow.logisticsId)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const filteredData = logistics.filter((item: any) => {
    const matchesSearch =
      item.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.carrier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.orderId || item.order?.orderId)?.toString().includes(searchTerm);
    const matchesStatus = !statusFilter || getLatestStatus(item) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      label: "Total Shipments",
      value: logistics.length.toString(),
    },
    {
      label: "In Transit",
      value: logistics
        .filter((l: any) => getLatestStatus(l).toUpperCase().includes("TRANSIT"))
        .length.toString(),
    },
    {
      label: "Delivered",
      value: logistics
        .filter((l: any) => getLatestStatus(l).toUpperCase().includes("DELIVERED"))
        .length.toString(),
    },
    {
      label: "Awaiting Details",
      value: logistics
        .filter((l: any) => isAwaitingShipmentDetails(l))
        .length.toString(),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Logistics"
        subtitle="Manage shipments, tracking, and delivery information"
        actions={
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handleExport}>
              Export Data
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              Add Shipment
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
              placeholder="Search by tracking number, carrier, or order ID..."
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
              <option value="AWAITING_SHIPMENT_DETAILS">Awaiting Shipment Details</option>
              <option value="NO_UPDATE">No Update</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
              <option value="DELAYED">Delayed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logistics Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-500">Loading logistics data...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <DataTable
            data={filteredData}
            columns={columns}
            emptyMessage="No logistics data found"
            onRowClick={(row) => {
              console.log("Clicked row:", row);
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
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add Shipment</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID *
              </label>
              <select
                value={formData.orderId}
                onChange={(e) =>
                  setFormData({ ...formData, orderId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select Order</option>
                {orders.map((order: any) => (
                  <option key={order.orderId} value={order.orderId}>
                    Order #{order.orderId} -{" "}
                    {order.customerUsername || order.customerId}
                  </option>
                ))}
              </select>
            </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipment Date
                    </label>
                    <input
                      type="date"
                      value={formData.shipmentDate}
                      onChange={(e) =>
                        setFormData({ ...formData, shipmentDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) =>
                        setFormData({ ...formData, deliveryDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carrier *
                </label>
                <input
                  type="text"
                  value={formData.carrier}
                  onChange={(e) =>
                    setFormData({ ...formData, carrier: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number *
                </label>
                <input
                  type="text"
                  value={formData.trackingNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, trackingNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origin
                </label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) =>
                    setFormData({ ...formData, origin: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({ ...formData, destination: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.packageWeight}
                  onChange={(e) =>
                    setFormData({ ...formData, packageWeight: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Status Update
                </label>
                <input
                  type="text"
                  value={formData.statusUpdate}
                  onChange={(e) =>
                    setFormData({ ...formData, statusUpdate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., IN_TRANSIT, DELIVERED, DELAYED"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package Dimensions
              </label>
              <input
                type="text"
                value={formData.packageDimensions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    packageDimensions: e.target.value,
                  })
                }
                placeholder="e.g., 10x20x30 cm"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customs Doc URL
              </label>
              <input
                type="url"
                value={formData.customsDocUrl}
                onChange={(e) =>
                  setFormData({ ...formData, customsDocUrl: e.target.value })
                }
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
              <Button onClick={handleAdd}>Add Shipment</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
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
            Edit Shipment
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID *
              </label>
              <select
                value={formData.orderId}
                onChange={(e) =>
                  setFormData({ ...formData, orderId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select Order</option>
                {orders.map((order: any) => (
                  <option key={order.orderId} value={order.orderId}>
                    Order #{order.orderId} -{" "}
                    {order.customerUsername || order.customerId}
                  </option>
                ))}
              </select>
            </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipment Date
                    </label>
                    <input
                      type="date"
                      value={formData.shipmentDate}
                      onChange={(e) =>
                        setFormData({ ...formData, shipmentDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) =>
                        setFormData({ ...formData, deliveryDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carrier *
                </label>
                <input
                  type="text"
                  value={formData.carrier}
                  onChange={(e) =>
                    setFormData({ ...formData, carrier: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number *
                </label>
                <input
                  type="text"
                  value={formData.trackingNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, trackingNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origin
                </label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={(e) =>
                    setFormData({ ...formData, origin: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({ ...formData, destination: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.packageWeight}
                  onChange={(e) =>
                    setFormData({ ...formData, packageWeight: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Status Update
                </label>
                <input
                  type="text"
                  value={formData.statusUpdate}
                  onChange={(e) =>
                    setFormData({ ...formData, statusUpdate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., IN_TRANSIT, DELIVERED, DELAYED"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package Dimensions
              </label>
              <input
                type="text"
                value={formData.packageDimensions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    packageDimensions: e.target.value,
                  })
                }
                placeholder="e.g., 10x20x30 cm"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customs Doc URL
              </label>
              <input
                type="url"
                value={formData.customsDocUrl}
                onChange={(e) =>
                  setFormData({ ...formData, customsDocUrl: e.target.value })
                }
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
              <Button onClick={handleEdit}>Update Shipment</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Logistics Entry"
        message="Are you sure you want to delete this logistics entry? This action cannot be undone."
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

export default LogisticsPage;
