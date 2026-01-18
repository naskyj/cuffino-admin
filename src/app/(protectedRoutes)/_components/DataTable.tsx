"use client";

import React from "react";

import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (_value: unknown, _row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T) => void;
}

function DataTable<T>({
  data,
  columns,
  loading = false,
  emptyMessage = "No data available",
  className,
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(
                  "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => {
            const rowKey = (row as { id?: string | number } & T).id ?? rowIndex;
            return (
              <tr
                key={rowKey}
                className={cn(
                  "hover:bg-gray-50",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => {
                  const colKey = `${String(rowKey)}-${String(column.key)}`;
                  return (
                    <td
                      key={colKey}
                      className={cn(
                        "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
                        column.className
                      )}
                    >
                      {column.render
                        ? column.render(row[column.key as keyof T], row as T)
                        : String(row[column.key as keyof T] || "")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
