"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";
import DataTable from "../_components/DataTable";
import PageHeader from "../_components/PageHeader";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "customer" | "moderator";
  status: "active" | "inactive" | "suspended";
  joinDate: string;
  lastLogin: string;
  ordersCount: number;
}

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - in real app, this would come from API
  const usersData: User[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      role: "customer",
      status: "active",
      joinDate: "2024-01-01",
      lastLogin: "2024-01-10",
      ordersCount: 5,
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "admin",
      status: "active",
      joinDate: "2023-12-15",
      lastLogin: "2024-01-12",
      ordersCount: 0,
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      role: "customer",
      status: "active",
      joinDate: "2024-01-05",
      lastLogin: "2024-01-11",
      ordersCount: 3,
    },
    {
      id: "4",
      name: "Alice Brown",
      email: "alice.brown@example.com",
      role: "moderator",
      status: "inactive",
      joinDate: "2023-11-20",
      lastLogin: "2024-01-08",
      ordersCount: 1,
    },
    {
      id: "5",
      name: "Charlie Wilson",
      email: "charlie.wilson@example.com",
      role: "customer",
      status: "suspended",
      joinDate: "2024-01-03",
      lastLogin: "2024-01-09",
      ordersCount: 2,
    },
  ];

  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "moderator":
        return "bg-blue-100 text-blue-800";
      case "customer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      className: "font-medium",
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "role",
      header: "Role",
      render: (value: User["role"]) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(
            value
          )}`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value: User["status"]) => (
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
      key: "ordersCount",
      header: "Orders",
    },
    {
      key: "joinDate",
      header: "Join Date",
    },
    {
      key: "lastLogin",
      header: "Last Login",
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, row: User) => (
        <div className="flex gap-2">
          <button className="text-primary hover:text-primary-dark text-sm">
            Edit
          </button>
          <button className="text-gray-600 hover:text-gray-800 text-sm">
            View
          </button>
          {row.status === "active" ? (
            <button className="text-orange-600 hover:text-orange-800 text-sm">
              Suspend
            </button>
          ) : (
            <button className="text-green-600 hover:text-green-800 text-sm">
              Activate
            </button>
          )}
        </div>
      ),
    },
  ];

  const filteredData = usersData.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: "Total Users", value: usersData.length.toString() },
    { label: "Active Users", value: usersData.filter(u => u.status === "active").length.toString() },
    { label: "Admins", value: usersData.filter(u => u.role === "admin").length.toString() },
    { label: "New This Month", value: usersData.filter(u => new Date(u.joinDate) > new Date('2024-01-01')).length.toString() },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage user accounts and permissions"
        actions={
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              Export Users
            </Button>
            <Button variant="outline" size="sm">
              Bulk Actions
            </Button>
            <Button size="sm">Add User</Button>
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
              placeholder="Search by name or email..."
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
              <option value="suspended">Suspended</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={filteredData}
          columns={columns}
          emptyMessage="No users found"
          onRowClick={(row) => {
            // Handle row click - could navigate to user detail
            console.log("Clicked user:", row);
          }}
        />
      </div>
    </div>
  );
};

export default UsersPage;
