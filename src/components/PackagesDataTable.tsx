"use client";

import { useState, useMemo } from "react";
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
import { BillingPackage } from "@/lib/api";

interface PackagesDataTableProps {
  packages: BillingPackage[];
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export default function PackagesDataTable({ packages, onDelete, onRefresh }: PackagesDataTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<BillingPackage>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Package Name",
        cell: ({ row }) => (
          <div>
            <strong style={{ display: "block", fontSize: "0.95rem", marginBottom: 4 }}>
              {row.original.name}
            </strong>
            <small style={{ color: "#64748b", fontSize: "0.8rem", lineHeight: 1.4 }}>
              {row.original.description || "No description"}
            </small>
          </div>
        ),
      },
      {
        accessorKey: "priceMonthly",
        header: "Monthly Price",
        cell: ({ getValue }) => (
          <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>
            ${getValue<number>().toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "priceYearly",
        header: "Yearly Price",
        cell: ({ getValue }) => (
          <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>
            ${getValue<number>().toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "features",
        header: "Features",
        cell: ({ row }) => {
          const features = row.original.features || [];
          return (
            <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
              {features.length} feature{features.length !== 1 ? 's' : ''}
            </span>
          );
        },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ getValue }) => {
          const active = getValue<boolean>();
          return (
            <span
              className={`badge ${active ? 'healthy' : 'warn'}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: active ? "var(--success)" : "var(--warning)",
                }}
              />
              {active ? "Active" : "Inactive"}
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
                onClick={() => router.push(`/packages/${row.original.id}/edit`)}
                className="action-btn"
                style={{ textDecoration: "none", border: "none", cursor: "pointer", padding: "6px 12px" }}
              >
                Edit
              </button>
              
              <button
                onClick={() => {
                  onDelete(row.original.id);
                  setTimeout(onRefresh, 500);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: 6,
                  color: "#dc2626",
                  fontWeight: 500,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fee2e2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Deactivate
              </button>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [router, onDelete, onRefresh]
  );

  const table = useReactTable({
    data: packages,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div>
      {/* Filter Toolbar */}
      <div className="filter-toolbar" style={{ marginBottom: 20 }}>
        <label className="filter-control" style={{ flex: "1 1 auto", minWidth: "200px" }}>
          <span>Search packages</span>
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
              placeholder="Search name, description..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>
        </label>

        <label className="filter-control" style={{ flex: "0 0 auto", minWidth: "140px" }}>
          <span>Status</span>
          <select
            value={(table.getColumn("isActive")?.getFilterValue() as string) ?? ""}
            onChange={(e) =>
              table.getColumn("isActive")?.setFilterValue(
                e.target.value === "" ? undefined : e.target.value === "true"
              )
            }
            style={{ height: "42px" }}
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
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
            table.getColumn("isActive")?.setFilterValue(undefined);
            table.resetSorting();
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
                      No packages found
                    </p>
                    <p style={{ margin: "8px 0 0 0", fontSize: "0.875rem", color: "#64748b" }}>
                      {globalFilter || table.getColumn("isActive")?.getFilterValue() !== undefined
                        ? "Try adjusting your filters"
                        : "Get started by creating your first billing package"}
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
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} entries
          </small>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="filter-reset-btn"
              style={{ margin: 0, padding: "8px 16px" }}
              onClick={() => table.previousPage()}
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
              onClick={() => table.nextPage()}
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
