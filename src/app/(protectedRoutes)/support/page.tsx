"use client";

import React, { useState } from "react";

import { Button, Modal } from "@/components/ui";
import {
  Ticket,
  TicketStatus,
  TicketTier,
  useGetAllTicketsQuery,
  useUpdateTicketMutation,
} from "@/store/api";
import { showToast } from "@/utilities/toast";

import DataTable from "../_components/DataTable";
import PageHeader from "../_components/PageHeader";

// A2 (RISK_REGISTER.md): support/model/Ticket + SupportAgent existed as bare entities with no
// UI or API behind them at all - this is the staff triage inbox from SOP_CUSTOMER_SUPPORT.md
// (Tier 1 Support / Tier 2 Manager / Tier 3 Admin-Finance).

const TIER_LABEL: Record<TicketTier, string> = {
  TIER_1: "Tier 1 - Support",
  TIER_2: "Tier 2 - Manager",
  TIER_3: "Tier 3 - Admin/Finance",
};

const STATUS_COLOR: Record<TicketStatus, string> = {
  OPEN: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-700",
};

const SupportPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formStatus, setFormStatus] = useState<TicketStatus>("OPEN");
  const [formTier, setFormTier] = useState<TicketTier>("TIER_1");

  const { data: tickets = [], isLoading, refetch } = useGetAllTicketsQuery();
  const [updateTicket, { isLoading: isSaving }] = useUpdateTicketMutation();

  const openTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setFormStatus(ticket.status);
    setFormTier(ticket.tier);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedTicket) return;
    try {
      await updateTicket({
        ticketId: selectedTicket.ticketId,
        status: formStatus,
        tier: formTier,
      }).unwrap();
      showToast.success("Ticket updated");
      setShowModal(false);
      setSelectedTicket(null);
      refetch();
    } catch {
      showToast.error("Failed to update ticket");
    }
  };

  const filtered = tickets.filter((t) => {
    const matchesSearch =
      !searchTerm ||
      t.ticketId.toString().includes(searchTerm) ||
      t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerUsername?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || t.status === statusFilter;
    const matchesTier = !tierFilter || t.tier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  const stats = [
    { label: "Open", value: tickets.filter((t) => t.status === "OPEN").length },
    {
      label: "In Progress",
      value: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    },
    {
      label: "SLA Breached",
      value: tickets.filter((t) => t.slaBreached).length,
    },
    {
      label: "Resolved",
      value: tickets.filter((t) => t.status === "RESOLVED").length,
    },
  ];

  const columns = [
    { key: "ticketId", header: "ID", className: "font-medium" },
    { key: "subject", header: "Subject" },
    {
      key: "customerUsername",
      header: "Customer",
    },
    {
      key: "orderId",
      header: "Order",
      render: (value: unknown) => (value ? `#${value}` : "-"),
    },
    {
      key: "tier",
      header: "Tier",
      render: (value: unknown) => TIER_LABEL[value as TicketTier] || String(value),
    },
    {
      key: "status",
      header: "Status",
      render: (value: unknown, row: unknown) => {
        const ticket = row as Ticket;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                STATUS_COLOR[value as TicketStatus] || "bg-gray-100 text-gray-800"
              }`}
            >
              {String(value)}
            </span>
            {ticket.slaBreached && (
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                SLA breached
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "createdAt",
      header: "Created",
      render: (value: unknown) =>
        value ? new Date(value as string).toLocaleString() : "N/A",
    },
    {
      key: "actions",
      header: "Actions",
      render: (_value: unknown, row: unknown) => (
        <button
          type="button"
          onClick={() => openTicket(row as Ticket)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Manage
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Support Tickets" subtitle="Triage inbox (SOP_CUSTOMER_SUPPORT.md)" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by ticket ID, subject, or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Tiers</option>
              <option value="TIER_1">Tier 1 - Support</option>
              <option value="TIER_2">Tier 2 - Manager</option>
              <option value="TIER_3">Tier 3 - Admin/Finance</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-500">Loading tickets...</div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <DataTable data={filtered} columns={columns} emptyMessage="No tickets found" />
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTicket(null);
        }}
        showCloseButton
        className="max-w-lg"
      >
        {selectedTicket && (
          <div className="p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Ticket #{selectedTicket.ticketId}: {selectedTicket.subject}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                From {selectedTicket.customerUsername}
                {selectedTicket.orderId ? ` · Order #${selectedTicket.orderId}` : ""}
              </p>
            </div>
            <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md p-3 whitespace-pre-wrap">
              {selectedTicket.issueDescription}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as TicketStatus)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tier (escalate if needed)
                </label>
                <select
                  value={formTier}
                  onChange={(e) => setFormTier(e.target.value as TicketTier)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="TIER_1">Tier 1 - Support</option>
                  <option value="TIER_2">Tier 2 - Manager</option>
                  <option value="TIER_3">Tier 3 - Admin/Finance</option>
                </select>
              </div>
            </div>
            {selectedTicket.slaDueAt && (
              <p className="text-xs text-gray-500">
                SLA due {new Date(selectedTicket.slaDueAt).toLocaleString()}
                {selectedTicket.slaBreached ? " (breached)" : ""}
              </p>
            )}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowModal(false);
                  setSelectedTicket(null);
                }}
              >
                Close
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SupportPage;
