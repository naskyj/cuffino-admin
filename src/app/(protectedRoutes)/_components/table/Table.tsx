"use client";

import clsx from "clsx";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect } from "react";

import { Button } from "@/components/ui";
import { useMobile, useSingleState } from "@/hooks";

import Action, { ActionOptionProps } from "../Action/Action";
import { FilterOptionProps } from "../Filter/Filter";
import { ErrorBoundary } from "../shared_components/ErrorBoundary";
import Spinner from "../spinner/Spinner";
import TabBar from "../Tab/TabBar";
import { Paginator } from "./Paginator";
import { TableHead } from "./TableHead";

// import { useTable, Column } from "react-table";

const IndeterminateCheckbox = React.forwardRef<
  HTMLInputElement,
  { indeterminate?: boolean } & React.InputHTMLAttributes<HTMLInputElement>
>(({ indeterminate, ...rest }, ref) => {
  const defaultRef = React.useRef<HTMLInputElement>(null);
  const resolvedRef = ref || defaultRef;

  React.useEffect(() => {
    if (resolvedRef && "current" in resolvedRef && resolvedRef.current) {
      resolvedRef.current.indeterminate = !!indeterminate;
    }
  }, [resolvedRef, indeterminate]);

  return (
    <input
      className="rounded focus:ring-blue-500 form-checkbox border-gray-300 text-blue-600"
      type="checkbox"
      ref={resolvedRef as React.Ref<HTMLInputElement>}
      {...rest}
    />
  );
});
IndeterminateCheckbox.displayName = "IndeterminateCheckbox";

// TableEmpty component
export const TableEmpty = ({
  title,
  subtitle,
  image,
}: {
  title: string;
  subtitle: string;
  image?: string;
}) => (
  <div className="max-w-[664px] mx-auto  flex-1  py-10  text-center justify-center flex flex-col items-center ">
    <Image
      src={image ?? "/images/no-notification.png"}
      alt={title}
      width={200}
      height={200}
      className="object-contain"
    />
    <p className="text-base font-medium text-mid-night-80 mt-4">{title}</p>
    <p className="text-sm text-mid-night-40 mt-2">{subtitle}</p>
  </div>
);

// TableCol component
const TableCol = <TRow,>({
  col,
  rowIndex,
  id,
  isMobile,
  row,
  clickRowAction,
}: {
  rowIndex: number;
  id: string;
  isMobile: boolean;
  col: {
    view: (
      _row: TRow,
      _index: number
    ) =>
      | React.ReactNode
      | { mobile?: React.ReactNode | false; desktop: React.ReactNode };
  };
  row: TRow;
  clickRowAction?: (_row: TRow, _index: number) => void;
}) => {
  const view = col.view(row, rowIndex);
  const viewIsAnObject =
    typeof view !== "string" &&
    typeof view !== "boolean" &&
    typeof view !== "number" &&
    typeof view !== "bigint" &&
    view &&
    typeof view === "object" &&
    view !== null &&
    "desktop" in view;
  if (id) {
    return null;
  }
  if (isMobile && viewIsAnObject && view.mobile === false) return null;

  // Determine alignment based on content type
  const getAlignment = () => {
    const content = !viewIsAnObject
      ? view
      : isMobile && view.mobile
        ? view.mobile
        : view.desktop;
    const contentStr = String(content);

    // If it looks like an amount (starts with $), align right
    if (contentStr.startsWith("$")) return "text-left";
    // If it looks like a date (contains /), align right
    if (contentStr.includes("/")) return "text-left";
    // If it's a type (Image, Music, etc.), align center
    if (["Image", "Music", "Documents", "Video"].includes(contentStr)) {
      return "text-left";
    }
    // Default to left alignment
    return "text-left";
  };

  return (
    <td
      className={clsx(
        "px-6 py-4 text-sm font-normal",
        getAlignment(),
        clickRowAction && "cursor-pointer"
      )}
      onClick={() => clickRowAction?.(row, rowIndex)}
    >
      {!viewIsAnObject
        ? view
        : isMobile && view.mobile
          ? view.mobile
          : view.desktop}
    </td>
  );
};

// Pagination component
export const Pagination = ({
  page = 1,
  pageSize = 1,
  totalRows = 0,
  setPage,
  setPageSize: _setPageSize,
  currentLength,
  loading,
  withNumber: _withNumber,
}: {
  setPage?: (_page: number) => void;
  page?: number;
  pageSize?: number;
  setPageSize?: (_pageSize: number) => void;
  totalRows?: number;
  currentLength: number;
  loading: boolean;
  withNumber?: boolean;
}) => {
  const { isMobile } = useMobile();
  const lastPage = Math.ceil(totalRows / pageSize);

  return (
    <div className="flex items-center justify-center h-full px-4 py-1 text-sm text-blue-600">
      {isMobile ? (
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage?.(1)}
            className="mr-3"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage?.(page - 1)}
            disabled={page <= 1}
            className="mr-3"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="mx-3">
            Page {page} of {lastPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage?.(page + 1)}
            disabled={page >= lastPage}
            className="mr-3"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= lastPage}
            onClick={() => setPage?.(lastPage)}
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <Paginator
          page={page}
          pageSize={pageSize}
          loading={loading}
          currentLength={currentLength}
          setPage={setPage}
          totalRows={totalRows}
        />
      )}
    </div>
  );
};

export interface ITableProps<TRow> {
  id?: string;
  title?: string;
  onSearch?: (_value: string) => void;
  searchPlaceholder?: string;
  filterText?: string;
  searchValue?: string;
  bulkAction?: {
    text: React.ReactNode;
    action: (_ids: string[]) => void;
    type?: "info" | "warning" | "danger" | "success";
  }[];
  data?: NonNullable<TRow[]> | undefined;
  tabs?: string[];
  loading: boolean;
  emptyMessage?: React.ReactNode;
  columns: {
    header: React.ReactNode;
    view: (
      _row: TRow,
      _index: number
    ) =>
      | React.ReactNode
      | {
          mobile?: React.ReactNode | false;
          desktop: React.ReactNode;
        };
  }[];
  clickRowAction?: (_row: TRow, _index: number) => void;
  rowActions?: (_row: TRow, _index: number) => ActionOptionProps[];
  hideActionName?: boolean;
  pagination?: {
    setPage?: (_page: number) => void;
    page?: number;
    pageSize?: number;
    setPageSize?: (_pageSize: number) => void;
    totalRows?: number;
  };
  filterOptions?: FilterOptionProps[];
}

export function Table<TRow extends Record<string, unknown>>({
  id = "",
  columns,
  hideActionName = false,
  title = "",
  onSearch,
  searchPlaceholder,
  filterText,
  searchValue,
  filterOptions,
  ...props
}: ITableProps<TRow>) {
  const data = props.data ?? [];
  const isMobile = useSingleState(false);
  useEffect(() => {
    const handleResize = () => {
      isMobile.set(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile]);

  return (
    <ErrorBoundary>
      <div className="flex flex-col w-full bg-white rounded-lg shadow-sm">
        {/* Header Section with Title, Search, and Filter */}
        <TableHead
          title={title}
          onSearch={onSearch}
          filterOptions={filterOptions}
          searchPlaceholder={searchPlaceholder}
          filterText={filterText}
          searchValue={searchValue}
        />

        {/* Table Container */}
        <div className="overflow-hidden relative">
          {props.loading && (
            <div className="absolute top-0 w-full z-10 text-center">
              <Spinner />
            </div>
          )}

          {props.tabs && (
            <div className="px-6 pt-4">
              <TabBar tabs={props.tabs} />
            </div>
          )}

          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="sticky border-b top-0 ">
                <tr className="h-16">
                  {props.bulkAction && (
                    <th aria-label="Bulk action checkbox" className="w-12" />
                  )}
                  {columns.map((col) => {
                    const view = data[0] && col.view(data[0], 0);
                    const isAnObject =
                      typeof view !== "string" &&
                      typeof view !== "boolean" &&
                      typeof view !== "number" &&
                      typeof view !== "bigint" &&
                      view &&
                      typeof view === "object" &&
                      view !== null &&
                      "desktop" in view;
                    if (id) {
                      return null;
                    }
                    if (
                      isMobile.get &&
                      isAnObject &&
                      view &&
                      view?.mobile === false
                    ) {
                      return null;
                    }
                    return (
                      <th
                        key={`${String(col.header)}-head`}
                        className="px-6 py-4 text-sm font-semibold text-left whitespace-nowrap"
                      >
                        <div className="flex items-center justify-start gap-1">
                          {col.header}
                          <svg
                            className="w-3 h-3 opacity-70"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                            />
                          </svg>
                        </div>
                      </th>
                    );
                  })}
                  {props.rowActions &&
                    props.rowActions({} as TRow, 0).length > 0 && (
                      <th className="px-6 py-4 text-sm font-semibold text-center whitespace-nowrap">
                        {hideActionName ? "" : "Action"}
                      </th>
                    )}
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.length < 1 && !props.loading && (
                  <tr>
                    <td
                      colSpan={
                        columns.length +
                        (props.bulkAction ? 1 : 0) +
                        (props.rowActions ? 1 : 0)
                      }
                      className="py-20"
                    >
                      <div className="w-full grid place-content-center">
                        {props.emptyMessage ?? (
                          <TableEmpty
                            title="Nothing to see yet"
                            subtitle="Records will be listed here"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                )}
                {data.map((row, rowIndex) => (
                  <tr
                    // eslint-disable-next-line react/no-array-index-key
                    key={`row-${rowIndex}`}
                    className={clsx(
                      "h-16 border-b border-gray-100 last:border-b-0",
                      rowIndex % 2 === 0 ? "bg-white" : "bg-[#F4F5FA]",
                      props.clickRowAction &&
                        "hover:bg-blue-50 cursor-pointer transition-colors"
                    )}
                  >
                    {props.bulkAction && (
                      // eslint-disable-next-line jsx-a11y/control-has-associated-label
                      <td className="w-12 px-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {columns.map((col, colIndex) => (
                      <TableCol
                        // eslint-disable-next-line react/no-array-index-key
                        key={`row-${rowIndex}-col-${colIndex}`}
                        {...{
                          col,
                          row,
                          rowIndex,
                          id,
                          isMobile: isMobile.get,
                          clickRowAction: props.clickRowAction,
                        }}
                      />
                    ))}
                    {props.rowActions &&
                      props.rowActions({} as TRow, 0).length > 0 && (
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <Action
                              variant="vertical"
                              options={props.rowActions(row, rowIndex)}
                            />
                          </div>
                        </td>
                      )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer with Pagination */}
        {props.pagination && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white">
            {/* Rows per page */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-black">Rows per page</span>
              <select className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="1">1</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            {/* Pagination Navigation */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={(props.pagination.page || 1) === 1}
                className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-black disabled:text-gray-400 disabled:border-gray-200 hover:bg-gray-50 disabled:hover:bg-transparent"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={
                  (props.pagination.page || 1) *
                    (props.pagination.pageSize || 10) >=
                  (props.pagination.totalRows || 0)
                }
                className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-black disabled:text-gray-400 disabled:border-gray-200 hover:bg-gray-50 disabled:hover:bg-transparent"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
