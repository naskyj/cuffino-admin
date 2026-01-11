"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";
import DataTable from "../_components/DataTable";
import PageHeader from "../_components/PageHeader";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "inactive" | "out_of_stock";
  sku: string;
  createdAt: string;
}

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - in real app, this would come from API
  const productsData: Product[] = [
    {
      id: "1",
      name: "Wireless Headphones",
      category: "Electronics",
      price: 199.99,
      stock: 45,
      status: "active",
      sku: "WH-001",
      createdAt: "2024-01-01",
    },
    {
      id: "2",
      name: "Smart Watch",
      category: "Electronics",
      price: 299.99,
      stock: 23,
      status: "active",
      sku: "SW-002",
      createdAt: "2024-01-05",
    },
    {
      id: "3",
      name: "Coffee Maker",
      category: "Appliances",
      price: 89.99,
      stock: 0,
      status: "out_of_stock",
      sku: "CM-003",
      createdAt: "2024-01-03",
    },
    {
      id: "4",
      name: "Running Shoes",
      category: "Sports",
      price: 129.99,
      stock: 67,
      status: "active",
      sku: "RS-004",
      createdAt: "2024-01-07",
    },
    {
      id: "5",
      name: "Bluetooth Speaker",
      category: "Electronics",
      price: 79.99,
      stock: 12,
      status: "inactive",
      sku: "BS-005",
      createdAt: "2024-01-02",
    },
  ];

  const getStatusColor = (status: Product["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "out_of_stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    {
      key: "sku",
      header: "SKU",
      className: "font-medium",
    },
    {
      key: "name",
      header: "Product Name",
    },
    {
      key: "category",
      header: "Category",
    },
    {
      key: "price",
      header: "Price",
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: "stock",
      header: "Stock",
      render: (value: number) => (
        <span className={value === 0 ? "text-red-600 font-medium" : ""}>
          {value}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value: Product["status"]) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
            value
          )}`}
        >
          {value.replace("_", " ").toUpperCase()}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row: Product) => (
        <div className="flex gap-2">
          <button className="text-primary hover:text-primary-dark text-sm">
            Edit
          </button>
          <button className="text-gray-600 hover:text-gray-800 text-sm">
            View
          </button>
          <button className="text-red-600 hover:text-red-800 text-sm">
            Delete
          </button>
        </div>
      ),
    },
  ];

  const filteredData = productsData.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: "Total Products", value: productsData.length.toString() },
    { label: "Active", value: productsData.filter(p => p.status === "active").length.toString() },
    { label: "Out of Stock", value: productsData.filter(p => p.status === "out_of_stock").length.toString() },
    { label: "Low Stock (< 20)", value: productsData.filter(p => p.stock < 20 && p.stock > 0).length.toString() },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog and inventory"
        actions={
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              Import Products
            </Button>
            <Button variant="outline" size="sm">
              Export Catalog
            </Button>
            <Button size="sm">Add Product</Button>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
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
              placeholder="Search by product name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="appliances">Appliances</option>
              <option value="sports">Sports</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={filteredData}
          columns={columns}
          emptyMessage="No products found"
          onRowClick={(row) => {
            // Handle row click - could navigate to product detail
            console.log("Clicked product:", row);
          }}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
