"use client";

import React, { useState } from "react";
import { Button, Modal } from "@/components/ui";
import ConfirmDialog from "@/components/ConfirmDialog";
import { showToast } from "@/utilities/toast";
import {
  useGetAllInventoriesQuery,
  useCreateInventoryMutation,
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
  useGetAllProductsQuery,
  Inventory,
} from "@/store/api";
import DataTable from "../_components/DataTable";
import PageHeader from "../_components/PageHeader";

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { data: inventories = [], isLoading, refetch } =
    useGetAllInventoriesQuery();
  const { data: products = [] } = useGetAllProductsQuery();
  const [createInventory] = useCreateInventoryMutation();
  const [updateInventory] = useUpdateInventoryMutation();
  const [deleteInventory] = useDeleteInventoryMutation();

  const [formData, setFormData] = useState({
    productId: "",
    materialName: "",
    quantity: "",
    unit: "",
    location: "",
  });

  const handleAdd = async () => {
    try {
      await createInventory({
        productId: formData.productId ? Number(formData.productId) : undefined,
        materialName: formData.materialName,
        quantity: Number(formData.quantity),
        unit: formData.unit || undefined,
        location: formData.location || undefined,
      }).unwrap();
      showToast.success("Inventory item created successfully");
      setShowAddModal(false);
      resetForm();
      refetch();
    } catch (error) {
      showToast.error("Failed to create inventory item");
    }
  };

  const handleEdit = async () => {
    if (!selectedItem) return;
    try {
      await updateInventory({
        id: selectedItem.inventoryId,
        data: {
          productId: formData.productId ? Number(formData.productId) : undefined,
          materialName: formData.materialName,
          quantity: Number(formData.quantity),
          unit: formData.unit || undefined,
          location: formData.location || undefined,
        },
      }).unwrap();
      showToast.success("Inventory item updated successfully");
      setShowEditModal(false);
      setSelectedItem(null);
      resetForm();
      refetch();
    } catch (error) {
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
      } catch (error) {
        showToast.error("Failed to delete inventory item");
        setShowDeleteDialog(false);
        setItemToDelete(null);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      productId: "",
      materialName: "",
      quantity: "",
      unit: "",
      location: "",
    });
  };

  const openEditModal = (item: any) => {
    setSelectedItem(item);
    setFormData({
      productId: item.productId?.toString() || "",
      materialName: item.materialName || "",
      quantity: item.quantity?.toString() || "",
      unit: item.unit || "",
      location: item.location || "",
    });
    setShowEditModal(true);
  };

  const handleExport = () => {
    const csv = [
      [
        "Inventory ID",
        "Product ID",
        "Material Name",
        "Quantity",
        "Unit",
        "Location",
      ].join(","),
      ...inventories.map((inv: any) =>
        [
          inv.inventoryId,
          inv.productId || "",
          inv.materialName,
          inv.quantity,
          inv.unit || "",
          inv.location || "",
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
      key: "productId",
      header: "Product ID",
      render: (value: unknown) => (value as number) || "N/A",
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
      key: "location",
      header: "Location",
      render: (value: unknown) => (value as string) || "N/A",
    },
    {
      key: "actions",
      header: "Actions",
      render: (_value: unknown, row: Inventory) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button
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
      item.productId?.toString().includes(searchTerm);
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
      value: new Set(inventories.map((inv: any) => inv.materialName)).size.toString(),
    },
    {
      label: "Low Stock",
      value: inventories.filter((inv: any) => (inv.quantity || 0) < 10).length.toString(),
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

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by ID, material name, or product ID..."
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
            onRowClick={(row) => {
              console.log("Clicked inventory:", row);
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
        showCloseButton={true}
        className="max-w-2xl"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Add Inventory Item
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product (Optional)
              </label>
              <select
                value={formData.productId}
                onChange={(e) =>
                  setFormData({ ...formData, productId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Product</option>
                {products.map((product: any) => (
                  <option key={product.productId} value={product.productId}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Name *
              </label>
              <input
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <input
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
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
        showCloseButton={true}
        className="max-w-2xl"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Edit Inventory Item
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product (Optional)
              </label>
              <select
                value={formData.productId}
                onChange={(e) =>
                  setFormData({ ...formData, productId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Product</option>
                {products.map((product: any) => (
                  <option key={product.productId} value={product.productId}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material Name *
              </label>
              <input
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <input
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
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
