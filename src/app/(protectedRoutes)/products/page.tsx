"use client";

import React, { useState } from "react";

import ConfirmDialog from "@/components/ConfirmDialog";
import { Button, Modal } from "@/components/ui";
import {
  ProductCustomizationDTO,
  useCreateCategoryMutation,
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetAllCategoriesQuery,
  useGetAllProductsQuery,
  useUpdateProductMutation,
  useUploadImageMutation,
} from "@/store/api";
import { showToast } from "@/utilities/toast";

import DataTable from "../_components/DataTable";
import PageHeader from "../_components/PageHeader";

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const { data: products = [], isLoading, refetch } = useGetAllProductsQuery();
  const { data: categories = [] } = useGetAllCategoriesQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [createCategory] = useCreateCategoryMutation();
  const [uploadImage] = useUploadImageMutation();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    categoryId: "",
    images: [] as string[],
    customizations: [] as ProductCustomizationDTO[],
  });

  const [customizationForm, setCustomizationForm] = useState({
    name: "",
    description: "",
    customizationType: "",
    customizationValue: "",
  });

  const [categoryFormData, setCategoryFormData] = useState({
    categoryName: "",
    description: "",
  });

  const getStatusColor = (product: any) =>
    // You can add status logic based on your product model
    "bg-green-100 text-green-800";
  const handleDeleteClick = (productId: number) => {
    setProductToDelete(productId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete).unwrap();
        showToast.success("Product deleted successfully");
        refetch();
        setShowDeleteDialog(false);
        setProductToDelete(null);
      } catch (error: any) {
        showToast.error(error?.data?.message || "Failed to delete product");
        setShowDeleteDialog(false);
        setProductToDelete(null);
      }
    }
  };

  const handleAdd = async () => {
    try {
      const productData: any = {
        name: formData.name,
        description: formData.description || undefined,
        price: Number(formData.price),
        stockQuantity: formData.stockQuantity
          ? Number(formData.stockQuantity)
          : 0,
        images: uploadedImages.map((url) => ({ imageUrl: url })),
        customizations:
          formData.customizations.length > 0
            ? formData.customizations
            : undefined,
      };

      if (formData.categoryId) {
        const selectedCategory = categories.find(
          (cat: any) => cat.categoryId.toString() === formData.categoryId
        );
        if (selectedCategory) {
          productData.category = {
            categoryName: selectedCategory.categoryName,
            description: selectedCategory.description,
          };
        }
      }

      await createProduct(productData).unwrap();
      showToast.success("Product created successfully");
      setShowAddModal(false);
      resetForm();
      refetch();
    } catch (error: any) {
      showToast.error(error?.data?.message || "Failed to create product");
    }
  };

  const handleEdit = async () => {
    if (!selectedProduct) return;
    try {
      const productData: any = {
        name: formData.name,
        description: formData.description || undefined,
        price: Number(formData.price),
        stockQuantity: formData.stockQuantity
          ? Number(formData.stockQuantity)
          : 0,
        images: uploadedImages.map((url) => ({ imageUrl: url })),
        customizations:
          formData.customizations.length > 0
            ? formData.customizations
            : undefined,
      };

      if (formData.categoryId) {
        const selectedCategory = categories.find(
          (cat: any) => cat.categoryId.toString() === formData.categoryId
        );
        if (selectedCategory) {
          productData.category = {
            categoryName: selectedCategory.categoryName,
            description: selectedCategory.description,
          };
        }
      }

      await updateProduct({
        id: selectedProduct.productId,
        data: productData,
      }).unwrap();
      showToast.success("Product updated successfully");
      setShowEditModal(false);
      setSelectedProduct(null);
      resetForm();
      refetch();
    } catch (error: any) {
      showToast.error(error?.data?.message || "Failed to update product");
    }
  };

  const handleCreateCategory = async () => {
    try {
      await createCategory({
        categoryName: categoryFormData.categoryName,
        description: categoryFormData.description || undefined,
      }).unwrap();
      showToast.success("Category created successfully");
      setShowCategoryModal(false);
      setCategoryFormData({ categoryName: "", description: "" });
      refetch();
    } catch (error: any) {
      showToast.error(error?.data?.message || "Failed to create category");
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const response = await uploadImage({ file }).unwrap();
      setUploadedImages([...uploadedImages, response.imageUrl]);
      showToast.success("Image uploaded successfully");
    } catch (error: any) {
      showToast.error(error?.data?.message || "Failed to upload image");
    }
  };

  const handleAddCustomization = () => {
    if (
      !customizationForm.name ||
      !customizationForm.customizationType ||
      !customizationForm.customizationValue
    ) {
      showToast.warning("Please fill in all required customization fields");
      return;
    }
    setFormData({
      ...formData,
      customizations: [
        ...formData.customizations,
        {
          name: customizationForm.name,
          description: customizationForm.description || undefined,
          customizationType: customizationForm.customizationType,
          customizationValue: customizationForm.customizationValue,
        },
      ],
    });
    setCustomizationForm({
      name: "",
      description: "",
      customizationType: "",
      customizationValue: "",
    });
    showToast.success("Customization added");
  };

  const handleRemoveCustomization = (index: number) => {
    setFormData({
      ...formData,
      customizations: formData.customizations.filter((_, i) => i !== index),
    });
    showToast.info("Customization removed");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stockQuantity: "",
      categoryId: "",
      images: [],
      customizations: [],
    });
    setUploadedImages([]);
    setCustomizationForm({
      name: "",
      description: "",
      customizationType: "",
      customizationValue: "",
    });
  };

  const openEditModal = async (product: any) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      stockQuantity: product.stockQuantity?.toString() || "0",
      categoryId: product.category?.categoryId?.toString() || "",
      images: product.images?.map((img: any) => img.imageUrl || img.url) || [],
      customizations:
        product.customizations?.map((cust: any) => ({
          customizationId: cust.customizationId,
          name: cust.name,
          description: cust.description,
          customizationType: cust.customizationType,
          customizationValue: cust.customizationValue,
        })) || [],
    });
    setUploadedImages(
      product.images?.map((img: any) => img.imageUrl || img.url) || []
    );
    setShowEditModal(true);
  };

  const handleExport = () => {
    const csv = [
      ["Product ID", "Name", "Description", "Price", "Category"].join(","),
      ...products.map((p: any) =>
        [
          p.productId,
          p.name,
          p.description || "",
          p.price,
          p.category?.categoryName || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-${new Date().toISOString()}.csv`;
    a.click();
  };

  const columns = [
    {
      key: "productId",
      header: "ID",
      className: "font-medium",
    },
    {
      key: "name",
      header: "Product Name",
    },
    {
      key: "category",
      header: "Category",
      render: (_value: any, row: any) =>
        row.category?.categoryName || "Uncategorized",
    },
    {
      key: "price",
      header: "Price",
      render: (value: unknown) => `$${(value as number)?.toFixed(2) || "0.00"}`,
    },
    {
      key: "status",
      header: "Status",
      render: (_value: any, row: any) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
            row
          )}`}
        >
          Active
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_value: any, row: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteClick(row.productId)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const filteredData = products.filter((product: any) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productId?.toString().includes(searchTerm);
    const matchesCategory =
      !categoryFilter ||
      product.category?.categoryId?.toString() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    {
      label: "Total Products",
      value: products.length.toString(),
    },
    {
      label: "Categories",
      value: categories.length.toString(),
    },
    {
      label: "Total Value",
      value: `$${products
        .reduce((sum: number, p: any) => sum + (p.price || 0), 0)
        .toFixed(2)}`,
    },
    {
      label: "Avg Price",
      value:
        products.length > 0
          ? `$${(
              products.reduce(
                (sum: number, p: any) => sum + (p.price || 0),
                0
              ) / products.length
            ).toFixed(2)}`
          : "$0.00",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog and inventory"
        actions={
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handleExport}>
              Export Catalog
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCategoryModal(true)}
            >
              Add Category
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              Add Product
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
              placeholder="Search by product name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Categories</option>
              {categories.map((cat: any) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-500">Loading products...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <DataTable
            data={filteredData}
            columns={columns}
            emptyMessage="No products found"
            onRowClick={(row) => {
              console.log("Clicked product:", row);
            }}
          />
        </div>
      )}

      {/* Add Product Modal */}
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
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add Product</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stockQuantity: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    Array.from(e.target.files).forEach((file) => {
                      handleImageUpload(file);
                    });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {uploadedImages.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {uploadedImages.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Upload ${index + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customizations
              </label>
              <div className="border border-gray-300 rounded-md p-4 space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Name (e.g., Color)"
                    value={customizationForm.name}
                    onChange={(e) =>
                      setCustomizationForm({
                        ...customizationForm,
                        name: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Type (e.g., SELECT)"
                    value={customizationForm.customizationType}
                    onChange={(e) =>
                      setCustomizationForm({
                        ...customizationForm,
                        customizationType: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g., Red, Blue)"
                    value={customizationForm.customizationValue}
                    onChange={(e) =>
                      setCustomizationForm({
                        ...customizationForm,
                        customizationValue: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCustomization}
                    className="text-sm"
                  >
                    Add
                  </Button>
                </div>
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={customizationForm.description}
                  onChange={(e) =>
                    setCustomizationForm({
                      ...customizationForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                {formData.customizations.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.customizations.map((cust, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <div className="text-sm">
                          <span className="font-medium">{cust.name}</span> (
                          {cust.customizationType}): {cust.customizationValue}
                          {cust.description && ` - ${cust.description}`}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomization(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
              <Button onClick={handleAdd}>Add Product</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
          resetForm();
        }}
        showCloseButton
        className="max-w-2xl"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Product</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stockQuantity: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    Array.from(e.target.files).forEach((file) => {
                      handleImageUpload(file);
                    });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {uploadedImages.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {uploadedImages.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Upload ${index + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customizations
              </label>
              <div className="border border-gray-300 rounded-md p-4 space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Name (e.g., Color)"
                    value={customizationForm.name}
                    onChange={(e) =>
                      setCustomizationForm({
                        ...customizationForm,
                        name: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Type (e.g., SELECT)"
                    value={customizationForm.customizationType}
                    onChange={(e) =>
                      setCustomizationForm({
                        ...customizationForm,
                        customizationType: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g., Red, Blue)"
                    value={customizationForm.customizationValue}
                    onChange={(e) =>
                      setCustomizationForm({
                        ...customizationForm,
                        customizationValue: e.target.value,
                      })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCustomization}
                    className="text-sm"
                  >
                    Add
                  </Button>
                </div>
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={customizationForm.description}
                  onChange={(e) =>
                    setCustomizationForm({
                      ...customizationForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                {formData.customizations.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.customizations.map((cust, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <div className="text-sm">
                          <span className="font-medium">{cust.name}</span> (
                          {cust.customizationType}): {cust.customizationValue}
                          {cust.description && ` - ${cust.description}`}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomization(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedProduct(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEdit}>Update Product</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setCategoryFormData({ categoryName: "", description: "" });
        }}
        showCloseButton
        className="max-w-md"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add Category</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={categoryFormData.categoryName}
                onChange={(e) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    categoryName: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={categoryFormData.description}
                onChange={(e) =>
                  setCategoryFormData({
                    ...categoryFormData,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCategoryModal(false);
                  setCategoryFormData({ categoryName: "", description: "" });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateCategory}>Add Category</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false);
          setProductToDelete(null);
        }}
        variant="danger"
      />
    </div>
  );
};

export default ProductsPage;
