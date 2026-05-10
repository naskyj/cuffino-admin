import React from "react";

import {
  InfiniteScrollSection,
  useInfiniteScroll,
} from "./InfinityScrollSection";
import { Table } from "./Table";

// Example data type
export interface TransactionData extends Record<string, unknown> {
  id: string;
  mediaName: string;
  type: "Image" | "Music" | "Documents" | "Video";
  amount: string;
  date: string;
}

// Example usage component
export function InfiniteScrollTable() {
  // Example data fetching function
  const fetchTransactions = async (
    page: number
  ): Promise<TransactionData[]> => {
    // Simulate API call
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    // Mock data
    const mockData: TransactionData[] = [
      {
        id: `IN ${Math.random().toString(36).substr(2, 8).toUpperCase()}#`,
        mediaName: "Content Name",
        type: "Image",
        amount: "$45",
        date: "22/01/25",
      },
      {
        id: `IN ${Math.random().toString(36).substr(2, 8).toUpperCase()}#`,
        mediaName: "Music Track",
        type: "Music",
        amount: "$12",
        date: "21/01/25",
      },
      {
        id: `IN ${Math.random().toString(36).substr(2, 8).toUpperCase()}#`,
        mediaName: "Document File",
        type: "Documents",
        amount: "$62",
        date: "20/01/25",
      },
      {
        id: `IN ${Math.random().toString(36).substr(2, 8).toUpperCase()}#`,
        mediaName: "Video Content",
        type: "Video",
        amount: "$532",
        date: "19/01/25",
      },
      {
        id: `IN ${Math.random().toString(36).substr(2, 8).toUpperCase()}#`,
        mediaName: "Another Document",
        type: "Documents",
        amount: "$500",
        date: "18/01/25",
      },
    ];

    // Simulate pagination - return empty array after page 5
    if (page > 5) {
      return [];
    }

    return mockData;
  };

  const { data, loading, error, hasMore, loadMore, reset } =
    useInfiniteScroll<TransactionData>(
      [], // Initial data
      fetchTransactions,
      {
        pageSize: 5,
        initialPage: 1,
        enabled: true,
      }
    );

  // Define table columns
  const columns = [
    {
      header: "Transaction ID",
      view: (row: TransactionData, _index: number) => row.id,
    },
    {
      header: "Media Name",
      view: (row: TransactionData, _index: number) => row.mediaName,
    },
    {
      header: "Type",
      view: (row: TransactionData, _index: number) => row.type,
    },
    {
      header: "Amount",
      view: (row: TransactionData, _index: number) => row.amount,
    },
    {
      header: "Date",
      view: (row: TransactionData, _index: number) => row.date,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Control buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={loadMore}
          disabled={loading || !hasMore}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Load More
        </button>
      </div>

      {/* Infinite scroll table */}
      <InfiniteScrollSection
        data={data}
        loading={loading}
        hasMore={hasMore}
        error={error}
        onLoadMore={loadMore}
        onError={(err) => console.error("Error loading data:", err)}
        className="space-y-0"
      >
        {(item, index) => (
          <div
            key={`${item.id}-${index}`}
            className={`
              flex items-center h-16 px-6 border-b border-gray-100 last:border-b-0
              ${index % 2 === 0 ? "bg-white" : "bg-[#F4F5FA]"}
              hover:bg-blue-50 transition-colors
            `}
          >
            <div className="flex-1 text-left text-sm font-normal">
              {item.id}
            </div>
            <div className="flex-1 text-left text-sm font-normal">
              {item.mediaName}
            </div>
            <div className="flex-1 text-center text-sm font-normal">
              {item.type}
            </div>
            <div className="flex-1 text-right text-sm font-normal">
              {item.amount}
            </div>
            <div className="flex-1 text-right text-sm font-normal">
              {item.date}
            </div>
          </div>
        )}
      </InfiniteScrollSection>

      {/* Alternative: Use with your existing Table component */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">
          Using with Table Component
        </h3>
        <Table
          title="Infinite Scroll Transactions"
          data={data}
          columns={columns}
          loading={loading}
          pagination={{
            page: 1,
            pageSize: 5,
            totalRows: data.length,
            setPage: () => {
              // No-op for infinite scroll
            },
            setPageSize: () => {
              // No-op for infinite scroll
            },
          }}
        />
      </div>
    </div>
  );
}

export default InfiniteScrollTable;
