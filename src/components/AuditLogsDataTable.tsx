"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import type { AuditLogEntry } from "@/lib/api";
import Swal from "sweetalert2";

interface AuditLogsDataTableProps {
  data: AuditLogEntry[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  // Filters
  actions: string[];
  actors: { id: string; name: string; email: string }[];
  filterAction: string;
  setFilterAction: (val: string) => void;
  filterActor: string;
  setFilterActor: (val: string) => void;
  filterFrom: string;
  setFilterFrom: (val: string) => void;
  filterTo: string;
  setFilterTo: (val: string) => void;
  limit: number;
  onLimitChange: (val: number) => void;
  onReset: () => void;
}

export default function AuditLogsDataTable({
  data,
  loading,
  page,
  totalPages,
  onPageChange,
  actions,
  actors,
  filterAction,
  setFilterAction,
  filterActor,
  setFilterActor,
  filterFrom,
  setFilterFrom,
  filterTo,
  setFilterTo,
  limit,
  onLimitChange,
  onReset,
}: AuditLogsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<AuditLogEntry>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: "Date & Time",
        cell: ({ row }) => (
          <span style={{ fontSize: "0.875rem", color: "#64748b", whiteSpace: "nowrap" }}>
            {new Date(row.original.createdAt).toLocaleString()}
          </span>
        ),
      },
      {
        id: "admin",
        header: "Admin",
        accessorFn: (row) => row.actorName || row.actorEmail,
        cell: ({ row }) => {
          const log = row.original;
          return (
            <div>
              <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                {log.actorName || "System"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                {log.actorEmail}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
          <span
            className="badge"
            style={{
              background: "var(--surface-hover)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              fontSize: "0.75rem",
            }}
          >
            {row.original.action}
          </span>
        ),
      },
      {
        id: "resource",
        header: "Resource",
        accessorFn: (row) => row.resourceName || row.resourceType,
        cell: ({ row }) => (
          <div>
            <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>
              {row.original.resourceName || "-"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              {row.original.resourceType}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "ipAddress",
        header: "IP Address",
        cell: ({ row }) => (
          <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
            {row.original.ipAddress}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          return status === "success" ? (
            <span className="badge badge-active">Success</span>
          ) : (
            <span className="badge badge-suspended">Failed</span>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <div>
      {/* Filter Toolbar matching Enterprise page style */}
      <div className="filter-toolbar" style={{ marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <label className="filter-control" style={{ flex: "1 1 auto", minWidth: "160px" }}>
          <span>Action Type</span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            style={{ height: "42px" }}
          >
            <option value="">All Actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-control" style={{ flex: "1 1 auto", minWidth: "160px" }}>
          <span>Admin User</span>
          <select
            value={filterActor}
            onChange={(e) => setFilterActor(e.target.value)}
            style={{ height: "42px" }}
          >
            <option value="">All Admins</option>
            {actors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name || a.email}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-control" style={{ flex: "1 1 auto", minWidth: "140px" }}>
          <span>From Date</span>
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            style={{ height: "42px" }}
          />
        </label>

        <label className="filter-control" style={{ flex: "1 1 auto", minWidth: "140px" }}>
          <span>To Date</span>
          <input
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            style={{ height: "42px" }}
          />
        </label>

        <label className="filter-control" style={{ flex: "0 0 auto", minWidth: "120px" }}>
          <span>Show Entries</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            style={{ height: "42px" }}
          >
            <option value={10}>10 entries</option>
            <option value={20}>20 entries</option>
            <option value={50}>50 entries</option>
            <option value={100}>100 entries</option>
          </select>
        </label>

        <button
          onClick={() => {
            onReset();
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
                      userSelect: "none" 
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
            {loading && data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: "3rem" }}>
                  <div className="spinner" style={{ margin: "0 auto" }}></div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-state-cell">
                  <div style={{ padding: "40px", textAlign: "center" }}>
                    <p style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>
                      No audit logs found
                    </p>
                    <p style={{ margin: "8px 0 0 0", fontSize: "0.875rem", color: "#64748b" }}>
                      Try adjusting your filters
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => {
                    const log = row.original;
                    Swal.fire({
                      title: "Audit Log Details",
                      html: `
                        <div style="text-align: left; font-size: 0.9rem;">
                          <p><strong>ID:</strong> ${log.id}</p>
                          <p><strong>Action:</strong> <span class="badge ${
                            log.status === "success" ? "badge-active" : "badge-suspended"
                          }">${log.action}</span></p>
                          <p><strong>Actor:</strong> ${log.actorName} (${log.actorEmail})</p>
                          <p><strong>Resource:</strong> ${log.resourceType} - ${
                        log.resourceName
                      }</p>
                          <p><strong>IP Address:</strong> ${log.ipAddress}</p>
                          <p><strong>User Agent:</strong> ${log.userAgent}</p>
                          <hr style="margin: 12px 0; border: 0; border-top: 1px solid var(--border);" />
                          ${
                            log.oldValues
                              ? `<div><strong>Old Values:</strong><pre style="background: var(--surface); padding: 8px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(
                                  log.oldValues,
                                  null,
                                  2
                                )}</pre></div>`
                              : ""
                          }
                          ${
                            log.newValues
                              ? `<div><strong>New Values:</strong><pre style="background: var(--surface); padding: 8px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(
                                  log.newValues,
                                  null,
                                  2
                                )}</pre></div>`
                              : ""
                          }
                        </div>
                      `,
                      width: "600px",
                      confirmButtonText: "Close",
                    });
                  }}
                  style={{ cursor: "pointer" }}
                  className="table-row-hover"
                >
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
      {!loading && totalPages > 0 && (
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
            Showing page {page} of {totalPages}
          </small>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="filter-reset-btn"
              style={{ margin: 0, padding: "8px 16px" }}
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
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
              Page {page} of {totalPages}
            </span>
            <button
              className="filter-reset-btn"
              style={{ margin: 0, padding: "8px 16px" }}
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
