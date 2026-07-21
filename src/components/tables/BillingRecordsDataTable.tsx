"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import type { BillingRecord } from "@/lib/types";

interface BillingRecordsDataTableProps {
  records: BillingRecord[];
  onRefresh: () => void;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
  onPaginationChange?: (page: number, limit: number) => void;
  onSearchChange?: (search: string) => void;
}

export default function BillingRecordsDataTable({ 
  records, 
  onRefresh,
  pagination,
  onPaginationChange,
  onSearchChange
}: BillingRecordsDataTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Debounce search to avoid spamming the backend
  useEffect(() => {
    const handler = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(globalFilter);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [globalFilter, onSearchChange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns = useMemo<ColumnDef<BillingRecord>[]>(
    () => [
      {
        accessorKey: "enterpriseName",
        header: "Enterprise",
        cell: ({ row }) => (
          <div>
            <strong style={{ display: "block", fontSize: "0.95rem", marginBottom: 4 }}>
              {row.original.enterpriseName || "Unknown"}
            </strong>
            <small style={{ color: "#64748b", fontSize: "0.8rem" }}>
              {row.original.packageName}
            </small>
          </div>
        ),
      },
      {
        accessorKey: "periodStart",
        header: "Billing Period",
        cell: ({ row }) => (
          <div style={{ fontSize: "0.875rem" }}>
            <div>{formatDate(row.original.periodStart)}</div>
            <small style={{ color: "#64748b" }}>
              to {formatDate(row.original.periodEnd)}
            </small>
          </div>
        ),
      },
      {
        accessorKey: "billingCycle",
        header: "Cycle",
        cell: ({ getValue }) => {
          const cycle = getValue<string>();
          return (
            <span style={{ fontSize: "0.875rem", textTransform: "capitalize" }}>
              {cycle}
            </span>
          );
        },
      },
      {
        accessorKey: "totalAmount",
        header: "Total Amount",
        cell: ({ row }) => (
          <div style={{ fontSize: "0.875rem" }}>
            <div style={{ fontWeight: 600 }}>
              {formatCurrency(row.original.totalAmount)}
            </div>
            <small style={{ color: "#64748b" }}>
              Base: {formatCurrency(row.original.amount)} + Tax: {formatCurrency(row.original.taxAmount)}
            </small>
          </div>
        ),
      },
      {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: ({ getValue }) => {
          const dueDate = new Date(getValue<string>());
          const today = new Date();
          const isOverdue = dueDate < today;
          
          return (
            <div style={{ fontSize: "0.875rem" }}>
              <div style={{ color: isOverdue ? "#ef4444" : "inherit" }}>
                {formatDate(getValue<string>())}
              </div>
              {isOverdue && (
                <small style={{ color: "#ef4444", fontWeight: 500 }}>
                  Overdue
                </small>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue<string>();
          const statusColors = {
            paid: "healthy",
            pending: "warn",
            overdue: "danger",
            cancelled: "muted",
          };
          const statusBgColors = {
            paid: "var(--success)",
            pending: "var(--warning)",
            overdue: "var(--danger)",
            cancelled: "var(--muted)",
          };
          
          return (
            <span
              className={`badge ${statusColors[status as keyof typeof statusColors]}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                textTransform: "capitalize",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: statusBgColors[status as keyof typeof statusBgColors],
                }}
              />
              {status}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          return (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => router.push(`/billing-records/${row.original.id}`)}
                className="action-btn"
                style={{ textDecoration: "none", border: "none", cursor: "pointer", padding: "6px 12px" }}
              >
                View Details
              </button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [router]
  );

  const table = useReactTable({
    data: records,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: {
        pageIndex: (pagination?.page || 1) - 1,
        pageSize: pagination?.limit || 10,
      }
    },
    pageCount: pagination?.totalPages || -1,
    manualPagination: true,
    manualFiltering: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      {/* Filter Toolbar */}
      <div className="filter-toolbar" style={{ marginBottom: 20 }}>
        <label className="filter-control" style={{ flex: "1 1 auto", minWidth: "200px" }}>
          <span>Search records</span>
          <div style={{ position: "relative", width: "100%" }}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                width: 16,
                height: 16,
                color: "var(--muted)",
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search enterprise, package..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>
        </label>

        <label className="filter-control" style={{ flex: "0 0 auto", minWidth: "120px" }}>
          <span>Show Entries</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            style={{ height: "42px" }}
          >
            <option value={5}>5 entries</option>
            <option value={10}>10 entries</option>
            <option value={25}>25 entries</option>
            <option value={50}>50 entries</option>
            <option value={100}>100 entries</option>
          </select>
        </label>

        <button
          onClick={() => {
            setGlobalFilter("");
            table.resetSorting();
            onRefresh();
          }}
          className="filter-reset-btn"
          style={{ height: "42px", display: "flex", alignItems: "center" }}
        >
          Reset
        </button>
      </div>

      {/* Data Table */}
      <div className="table-shell">
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      cursor: header.column.getCanSort() ? "pointer" : "default",
                      userSelect: "none",
                    }}
                  >
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            width: 12,
                            height: 12,
                            transform:
                              header.column.getIsSorted() === "desc"
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                            color: "var(--accent)",
                          }}
                        >
                          <path d="M12 5v14" />
                          <path d="m19 12-7-7-7 7" />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-state-cell">
                  <div style={{ padding: "40px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>
                      No billing records found
                    </p>
                    <p style={{ margin: "8px 0 0 0", fontSize: "0.875rem", color: "#64748b" }}>
                      {globalFilter
                        ? "Try adjusting your search or filters"
                        : "Billing records will appear here when enterprises are created"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
            padding: "16px 0",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <small style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Showing{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{" "}
            to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              pagination?.total || 0
            )}{" "}
            of {pagination?.total || 0} entries
          </small>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="filter-reset-btn"
              style={{ margin: 0, padding: "8px 16px" }}
              onClick={() => {
                if (onPaginationChange && table.getCanPreviousPage()) {
                  onPaginationChange(table.getState().pagination.pageIndex, table.getState().pagination.pageSize);
                }
              }}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>
            <span
              style={{
                padding: "8px 16px",
                background: "#f1f5f9",
                borderRadius: 6,
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#475569",
              }}
            >
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <button
              className="filter-reset-btn"
              style={{ margin: 0, padding: "8px 16px" }}
              onClick={() => {
                if (onPaginationChange && table.getCanNextPage()) {
                  onPaginationChange(table.getState().pagination.pageIndex + 2, table.getState().pagination.pageSize);
                }
              }}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
