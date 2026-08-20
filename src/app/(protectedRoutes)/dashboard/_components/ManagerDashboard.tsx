"use client";

import Link from "next/link";
import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  useGetAllLogisticsQuery,
  useGetAllProductionQueuesQuery,
  useGetAllReturnsQuery,
  useGetAllTicketsQuery,
} from "@/store/api";

import { StatCard } from "../../_components";
import {
  LogisticsIcon,
  OrdersIcon,
  ProductsIcon,
} from "../../_components/assets";
import PageHeader from "../../_components/PageHeader";

// Manager's job per CUFFINO_OPERATIONS_SOP.md: quality control, tailor sourcing/assignment,
// shipping coordination, fit-failure case resolution, capacity forecasting - none of which the
// admin dashboard's revenue/user-count metrics speak to. This is built from the same data the
// Production/Returns/Support/Logistics pages already use, just aggregated around what a Manager
// actually needs to see first.

const PRODUCTION_STATUS_COLORS: Record<string, string> = {
  QUEUED: "#94a3b8",
  ASSIGNED: "#6366f1",
  FABRIC_ACQUISITION: "#f59e0b",
  IN_PROGRESS: "#8b5cf6",
  IN_PRODUCTION: "#8b5cf6",
  QUALITY_CHECK: "#0d9488",
  READY_FOR_SHIPMENT: "#10b981",
};

const OPEN_RETURN_STATUSES = new Set([
  "REQUESTED",
  "APPROVED",
  "RECEIVED",
  "INSPECTED",
  "REWORK",
]);

const QUICK_ACTIONS = [
  {
    href: "/production",
    title: "Production Queue",
    description: "Assignments, stages, overdue items",
    icon: ProductsIcon,
    color: "purple",
  },
  {
    href: "/returns",
    title: "Returns",
    description: "Fit and quality cases to resolve",
    icon: OrdersIcon,
    color: "amber",
  },
  {
    href: "/logistics",
    title: "Logistics",
    description: "Shipments and tracking",
    icon: LogisticsIcon,
    color: "blue",
  },
  {
    href: "/support",
    title: "Support",
    description: "Tier 2 escalations",
    icon: OrdersIcon,
    color: "green",
  },
] as const;

const QUICK_ACTION_COLORS: Record<
  string,
  { bg: string; hoverBg: string; iconBg: string; iconText: string; border: string }
> = {
  blue: {
    bg: "bg-blue-50",
    hoverBg: "hover:bg-blue-100",
    iconBg: "bg-blue-600",
    iconText: "text-blue-900",
    border: "border-blue-200",
  },
  green: {
    bg: "bg-green-50",
    hoverBg: "hover:bg-green-100",
    iconBg: "bg-green-600",
    iconText: "text-green-900",
    border: "border-green-200",
  },
  purple: {
    bg: "bg-purple-50",
    hoverBg: "hover:bg-purple-100",
    iconBg: "bg-purple-600",
    iconText: "text-purple-900",
    border: "border-purple-200",
  },
  amber: {
    bg: "bg-amber-50",
    hoverBg: "hover:bg-amber-100",
    iconBg: "bg-amber-600",
    iconText: "text-amber-900",
    border: "border-amber-200",
  },
};

const formatStatusLabel = (status: string) =>
  status
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

const ManagerDashboard = () => {
  const { data: productionQueues, isLoading: productionLoading } =
    useGetAllProductionQueuesQuery();
  const { data: returns, isLoading: returnsLoading } = useGetAllReturnsQuery();
  const { data: tickets, isLoading: ticketsLoading } = useGetAllTicketsQuery();
  const { data: logistics, isLoading: logisticsLoading } = useGetAllLogisticsQuery();

  const isLoading =
    productionLoading || returnsLoading || ticketsLoading || logisticsLoading;

  const queues = productionQueues || [];
  const returnsList = returns || [];
  const ticketsList = tickets || [];
  const logisticsList = logistics || [];

  const now = Date.now();
  const overdueProduction = queues.filter(
    (q) =>
      q.status !== "READY_FOR_SHIPMENT" &&
      q.estimatedCompletionDate &&
      new Date(q.estimatedCompletionDate).getTime() < now
  );

  const openReturns = returnsList.filter((r) => OPEN_RETURN_STATUSES.has(r.status));

  const escalatedTickets = ticketsList.filter(
    (t) => t.slaBreached && t.status !== "RESOLVED" && t.status !== "CLOSED"
  );

  const stats = [
    { label: "Active Production Items", value: queues.length.toString() },
    { label: "Overdue Production", value: overdueProduction.length.toString() },
    { label: "Open Returns", value: openReturns.length.toString() },
    { label: "SLA-Breached Tickets", value: escalatedTickets.length.toString() },
  ];

  const productionByStage = Object.entries(
    queues.reduce<Record<string, number>>((acc, q) => {
      const status = q.status || "UNKNOWN";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({
    status: formatStatusLabel(status),
    count,
    fill: PRODUCTION_STATUS_COLORS[status] || "#6b7280",
  }));

  // Workload per tailor - real data (assignment counts), not the SOP's "quality scorecard",
  // which isn't tracked anywhere in the schema yet. Only counts items still in progress, not
  // items already shipped, so this reflects current capacity, not lifetime volume.
  const tailorWorkload = Object.entries(
    queues
      .filter((q) => q.status !== "READY_FOR_SHIPMENT" && q.assignedDesignerName)
      .reduce<Record<string, number>>((acc, q) => {
        const name = q.assignedDesignerName as string;
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {})
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const shipmentsByStatus = Object.entries(
    logisticsList.reduce<Record<string, number>>((acc, l) => {
      const status = (l.shipmentStatus || "UNKNOWN").toUpperCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {})
  ).map(([status, value], index) => ({
    label: formatStatusLabel(status),
    value,
    fill: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#94a3b8"][index % 6],
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manager Dashboard"
        subtitle="Production, quality, returns, and shipping - what needs your attention today."
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading dashboard data...</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Returns Needing Attention
              </h3>
              <div className="space-y-4">
                {openReturns.length > 0 ? (
                  openReturns.slice(0, 5).map((r) => (
                    <div
                      key={r.returnId}
                      className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Return #{r.returnId} - Order #{r.orderId}
                        </p>
                        <p className="text-xs text-gray-500">
                          {r.reasonCategory ? formatStatusLabel(r.reasonCategory) : "Reason not categorized"}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">{formatStatusLabel(r.status)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 py-4">No open returns right now.</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                {QUICK_ACTIONS.map((action) => {
                  const colors = QUICK_ACTION_COLORS[action.color];
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className={`group p-4 border rounded-lg transition-all text-left ${colors.bg} ${colors.hoverBg} ${colors.border} hover:shadow-md hover:-translate-y-0.5`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg ${colors.iconBg} flex items-center justify-center mb-3 shadow-sm`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className={`text-sm font-semibold ${colors.iconText}`}>{action.title}</div>
                      <div className="text-xs text-gray-600 mt-1">{action.description}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Production by Stage
              </h3>
              <div className="h-72">
                {productionByStage.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productionByStage}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="status" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {productionByStage.map((entry) => (
                          <Cell key={entry.status} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-gray-500">
                    No items in the production queue.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tailor Workload (active items)
              </h3>
              <div className="h-72">
                {tailorWorkload.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tailorWorkload} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-gray-500">
                    No tailors currently assigned active work.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Shipments by Status
              </h3>
              <div className="h-72">
                {shipmentsByStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={shipmentsByStatus}
                        dataKey="value"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label
                      >
                        {shipmentsByStatus.map((entry) => (
                          <Cell key={entry.label} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-gray-500">
                    No shipments recorded yet.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Escalated Support Tickets
              </h3>
              <div className="space-y-4 max-h-72 overflow-y-auto">
                {escalatedTickets.length > 0 ? (
                  escalatedTickets.slice(0, 6).map((t) => (
                    <div
                      key={t.ticketId}
                      className="flex items-start justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          #{t.ticketId} - {t.subject}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t.customerUsername} - {formatStatusLabel(t.category)}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-red-600">SLA breached</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 py-4">
                    No SLA-breached tickets right now.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerDashboard;
