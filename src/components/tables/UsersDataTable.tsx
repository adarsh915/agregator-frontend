"use client";

import { useState, useMemo, useEffect } from "react";
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
import { InternalUser } from "@/lib/types";
import RequirePermission from "../auth/RequirePermission";

interface UsersDataTableProps {
  data: InternalUser[];
  currentUserEmail: string | null;
  onEdit: (user: InternalUser) => void;
  onDelete: (user: InternalUser) => void;
  pagination?: { total: number; page: number; limit: number; totalPages: number };
  onPaginationChange?: (page: number, limit: number) => void;
  onSearchChange?: (search: string) => void;
}

export default function UsersDataTable({
  data,
  currentUserEmail,
  onEdit,
  onDelete,
  pagination,
  onPaginationChange,
  onSearchChange,
}: UsersDataTableProps) {
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

  const columns = useMemo<ColumnDef<InternalUser>[]>(
    () => [
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                }}
              >
                {user.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "0.9rem" }}>
                  {user.name}
                </strong>
                {user.email === currentUserEmail && (
                  <span
                    className="badge info"
                    style={{
                      fontSize: "0.7rem",
                      padding: "2px 8px",
                      marginTop: 4,
                    }}
                  >
                    You
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email Address",
        cell: ({ row }) => (
          <a
            href={`mailto:${row.original.email}`}
            style={{
              color: "#3b82f6",
              textDecoration: "none",
              fontSize: "0.875rem",
            }}
          >
            {row.original.email}
          </a>
        ),
      },
      {
        accessorKey: "roles",
        header: "Assigned Roles",
        cell: ({ row }) => (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {row.original.roles && row.original.roles.length > 0 ? (
              row.original.roles.map((roleName, idx) => (
                <span
                  key={idx}
                  className="badge info"
                  style={{ fontSize: "0.75rem" }}
                >
                  {roleName}
                </span>
              ))
            ) : (
              <span
                className="badge"
                style={{
                  backgroundColor: "#94a3b8",
                  color: "white",
                  fontSize: "0.75rem",
                }}
              >
                No Role
              </span>
            )}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <span
              className={`badge ${status === "Active" ? "healthy" : "critical"}`}
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
                  backgroundColor:
                    status === "Active" ? "var(--success)" : "var(--danger)",
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
          const user = row.original;
          const isCurrentUser = user.email === currentUserEmail;
          return (
            <div style={{ display: "flex", gap: 6 }}>
              <RequirePermission resource="users" action="update" mode="hide">
                <button onClick={() => onEdit(user)} className="action-btn">
                  Edit
                </button>
              </RequirePermission>
              <RequirePermission resource="users" action="delete" mode="hide">
                <button
                  onClick={() => onDelete(user)}
                  className="action-btn danger"
                  disabled={isCurrentUser}
                  style={{
                    opacity: isCurrentUser ? 0.5 : 1,
                    cursor: isCurrentUser ? "not-allowed" : "pointer",
                  }}
                  title={isCurrentUser ? "Cannot deactivate your own account" : ""}
                >
                  Deactivate
                </button>
              </RequirePermission>
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [currentUserEmail, onEdit, onDelete]
  );

  const table = useReactTable({
    data,
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
          <span>Search users</span>
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
              placeholder="Search name, email or role..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              style={{ paddingLeft: 38 }}
            />
          </div>
        </label>

        <label className="filter-control" style={{ flex: "0 0 auto", minWidth: "140px" }}>
          <span>Status</span>
          <select
            value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
            onChange={(e) =>
              table.getColumn("status")?.setFilterValue(e.target.value || undefined)
            }
            style={{ height: "42px" }}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
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
            table.getColumn("status")?.setFilterValue(undefined);
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
                      No users found
                    </p>
                    <p style={{ margin: "8px 0 0 0", fontSize: "0.875rem", color: "#64748b" }}>
                      {globalFilter || table.getColumn("status")?.getFilterValue()
                        ? "Try adjusting your filters"
                        : "Get started by adding your first user"}
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
