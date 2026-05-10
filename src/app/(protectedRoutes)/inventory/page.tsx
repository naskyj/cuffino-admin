"use client";

import React, { useState } from "react";

import ConfirmDialog from "@/components/ConfirmDialog";
import { Button, Modal } from "@/components/ui";
import {
  Inventory,
  useCreateInventoryMutation,
  useDeleteInventoryMutation,
  useGetAllInventoriesQuery,
  useUpdateInventoryMutation,
} from "@/store/api";
import { showToast } from "@/utilities/toast";

import DataTable from "../_components/DataTable";
import PageHeader from "../_components/PageHeader";

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);

  const {
    data: inventories = [],
    isLoading,
    refetch,
  } = useGetAllInventoriesQuery();
  const [createInventory] = useCreateInventoryMutation();
  const [updateInventory] = useUpdateInventoryMutation();
  const [deleteInventory] = useDeleteInventoryMutation();

  const [formData, setFormData] = useState({
    materialName: "",
    quantity: "",
    unit: "",
    restockThreshold: "",
    vendorId: "",
  });

  const resetForm = () => {
    setFormData({
      materialName: "",
      quantity: "",
      unit: "",
      restockThreshold: "",
      vendorId: "",
    });
  };

  const handleAdd = async () => {
    try {
      await createInventory({
        materialName: formData.materialName,
        quantity: Number(formData.quantity),
        unit: formData.unit || undefined,
        restockThreshold: formData.restockThreshold
          ? Number(formData.restockThreshold)
          : undefined,
        vendorId: formData.vendorId ? Number(formData.vendorId) : undefined,
      }).unwrap();
      showToast.success("Inventory item created successfully");
      setShowAddModal(false);
      resetForm();
      refetch();
    } catch {
      showToast.error("Failed to create inventory item");
    }
  };

  const handleEdit = async () => {
    if (!selectedItem) return;
    try {
      await updateInventory({
        id: selectedItem.inventoryId,
        data: {
          materialName: formData.materialName,
          quantity: Number(formData.quantity),
          unit: formData.unit || undefined,
          restockThreshold: formData.restockThreshold
            ? Number(formData.restockThreshold)
            : undefined,
          vendorId: formData.vendorId ? Number(formData.vendorId) : undefined,
        },
      }).unwrap();
      showToast.success("Inventory item updated successfully");
      setShowEditModal(false);
      setSelectedItem(null);
      resetForm();
      refetch();
    } catch {
      showToast.error("Failed to update inventory item");
    }
  };

  const handleDeleteClick = (inventoryId: number) => {
    setItemToDelete(inventoryId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        await deleteInventory(itemToDelete).unwrap();
        showToast.success("Inventory item deleted successfully");
        refetch();
        setShowDeleteDialog(false);
        setItemToDelete(null);
      } catch {
        showToast.error("Failed to delete inventory item");
        setShowDeleteDialog(false);
        setItemToDelete(null);
      }
    }
  };

  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setFormData({
      materialName: item.materialName || "",
      quantity: item.quantity?.toString() || "",
      unit: item.unit || "",
      restockThreshold: item.restockThreshold?.toString() || "",
      vendorId: item.vendor?.vendorId?.toString() || "",
    });
    setShowEditModal(true);
  };

  const handleExport = () => {
    const csv = [
      [
        "Inventory ID",
        "Material Name",
        "Quantity",
        "Unit",
        "Restock Threshold",
        "Vendor ID",
      ].join(","),
      ...inventories.map((inv: any) =>
        [
          inv.inventoryId,
          inv.materialName,
          inv.quantity,
          inv.unit || "",
          inv.restockThreshold || "",
          inv.vendor?.vendorId || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${new Date().toISOString()}.csv`;
    a.click();
  };

  const columns = [
    {
      key: "inventoryId",
      header: "ID",
      className: "font-medium",
    },
    {
      key: "materialName",
      header: "Material Name",
    },
    {
      key: "quantity",
      header: "Quantity",
    },
    {
      key: "unit",
      header: "Unit",
      render: (value: unknown) => (value as string) || "N/A",
    },
    {
      key: "restockThreshold",
      header: "Restock Threshold",
      render: (value: unknown) => (value as number) || "N/A",
    },
    {
      key: "vendor",
      header: "Vendor ID",
      render: (value: unknown) =>
        (value as { vendorId?: number } | undefined)?.vendorId || "N/A",
    },
    {
      key: "actions",
      header: "Actions",
      render: (_value: unknown, row: Inventory) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openEditModal(row)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDeleteClick(row.inventoryId)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const filteredData = inventories.filter((item: any) => {
    const matchesSearch =
      item.inventoryId?.toString().includes(searchTerm) ||
      item.materialName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor?.vendorId?.toString().includes(searchTerm);
    return matchesSearch;
  });

  const stats = [
    {
      label: "Total Items",
      value: inventories.length.toString(),
    },
    {
      label: "Total Quantity",
      value: inventories
        .reduce((sum: number, inv: any) => sum + (inv.quantity || 0), 0)
        .toString(),
    },
    {
      label: "Unique Materials",
      value: new Set(
        inventories.map((inv: any) => inv.materialName)
      ).size.toString(),
    },
    {
      label: "Low Stock",
      value: inventories
        .filter(
          (inv: any) =>
            (inv.quantity || 0) <= (inv.restockThreshold || Number.MAX_SAFE_INTEGER)
        )
        .length.toString(),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        subtitle="Manage inventory and materials"
        actions={
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handleExport}>
              Export Inventory
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              Add Inventory
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

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by ID, material name, or vendor ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-500">Loading inventory...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <DataTable
            data={filteredData}
            columns={columns}
            emptyMessage="No inventory items found"
            onRowClick={() => {
              // Row click handler
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
            Add Inventory Item
          </h2>
          <div className="space-y-4">
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2">
                Material Name *
              </p>
              <input
                aria-label="Add material name"
                type="text"
                value={formData.materialName}
                onChange={(e) =>
                  setFormData({ ...formData, materialName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </p>
                <input
                  aria-label="Add inventory quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </p>
                <input
                  aria-label="Add inventory unit"
                  type="text"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  placeholder="e.g., kg, meters, pieces"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Restock Threshold
                </p>
                <input
                  aria-label="Add restock threshold"
                  type="number"
                  value={formData.restockThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      restockThreshold: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor ID
                </p>
                <input
                  aria-label="Add vendor id"
                  type="number"
                  value={formData.vendorId}
                  onChange={(e) =>
                    setFormData({ ...formData, vendorId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
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
              <Button onClick={handleAdd}>Add Item</Button>
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
            Edit Inventory Item
          </h2>
          <div className="space-y-4">
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2">
                Material Name *
              </p>
              <input
                aria-label="Edit material name"
                type="text"
                value={formData.materialName}
                onChange={(e) =>
                  setFormData({ ...formData, materialName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </p>
                <input
                  aria-label="Edit inventory quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </p>
                <input
                  aria-label="Edit inventory unit"
                  type="text"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                  placeholder="e.g., kg, meters, pieces"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Restock Threshold
                </p>
                <input
                  aria-label="Edit restock threshold"
                  type="number"
                  value={formData.restockThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      restockThreshold: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor ID
                </p>
                <input
                  aria-label="Edit vendor id"
                  type="number"
                  value={formData.vendorId}
                  onChange={(e) =>
                    setFormData({ ...formData, vendorId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Inventory Item"
        message="Are you sure you want to delete this inventory item? This action cannot be undone."
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

export default InventoryPage;
