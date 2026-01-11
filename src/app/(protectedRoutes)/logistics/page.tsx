"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";
import DataTable from "../_components/DataTable";
import PageHeader from "../_components/PageHeader";

interface LogisticsItem {
  id: string;
  trackingNumber: string;
  status: "pending" | "in-transit" | "delivered" | "delayed";
  origin: string;
  destination: string;
  carrier: string;
  estimatedDelivery: string;
  customer: string;
}

const LogisticsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - in real app, this would come from API
  const logisticsData: LogisticsItem[] = [
    {
      id: "1",
      trackingNumber: "TRK001234567",
      status: "in-transit",
      origin: "New York, NY",
      destination: "Los Angeles, CA",
      carrier: "FedEx",
      estimatedDelivery: "2024-01-15",
      customer: "John Doe",
    },
    {
      id: "2",
      trackingNumber: "TRK001234568",
      status: "delivered",
      origin: "Chicago, IL",
      destination: "Miami, FL",
      carrier: "UPS",
      estimatedDelivery: "2024-01-12",
      customer: "Jane Smith",
    },
    {
      id: "3",
      trackingNumber: "TRK001234569",
      status: "pending",
      origin: "Seattle, WA",
      destination: "Boston, MA",
      carrier: "USPS",
      estimatedDelivery: "2024-01-18",
      customer: "Bob Johnson",
    },
    {
      id: "4",
      trackingNumber: "TRK001234570",
      status: "delayed",
      origin: "Denver, CO",
      destination: "Phoenix, AZ",
      carrier: "FedEx",
      estimatedDelivery: "2024-01-16",
      customer: "Alice Brown",
    },
  ];

  const getStatusColor = (status: LogisticsItem["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-transit":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "delayed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    {
      key: "trackingNumber",
      header: "Tracking Number",
      className: "font-medium",
    },
    {
      key: "customer",
      header: "Customer",
    },
    {
      key: "origin",
      header: "Origin",
    },
    {
      key: "destination",
      header: "Destination",
    },
    {
      key: "carrier",
      header: "Carrier",
    },
    {
      key: "status",
      header: "Status",
      render: (value: LogisticsItem["status"]) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
            value
          )}`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: "estimatedDelivery",
      header: "Est. Delivery",
    },
  ];

  const filteredData = logisticsData.filter((item) =>
    item.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.carrier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Logistics"
        subtitle="Manage shipments, tracking, and delivery information"
        actions={
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              Export Data
            </Button>
            <Button size="sm">Add Shipment</Button>
          </div>
        }
      />

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by tracking number, customer, or carrier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="delayed">Delayed</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">All Carriers</option>
              <option value="FedEx">FedEx</option>
              <option value="UPS">UPS</option>
              <option value="USPS">USPS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logistics Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={filteredData}
          columns={columns}
          emptyMessage="No logistics data found"
          onRowClick={(row) => {
            // Handle row click - could navigate to detail view
            console.log("Clicked row:", row);
          }}
        />
      </div>
    </div>
  );
};

export default LogisticsPage;
