"use client";

import { useState, useMemo, useEffect } from "react";
import Swal from "sweetalert2";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { useDashboard } from "../layout";
import { Detection, Enterprise } from "@/lib/types";
import "./detections.css";

export default function DetectionsPage() {
  const { detections, setDetections } = useDashboard();

  // Search/Filters local state
  const [detSearchQuery, setDetSearchQuery] = useState("");
  const [detFilterEnterprise, setDetFilterEnterprise] = useState("All");
  const [detFilterType, setDetFilterType] = useState("All");
  const [detFilterSeverity, setDetFilterSeverity] = useState("All");
  const [detFilterStatus, setDetFilterStatus] = useState("All");
  const [detPage, setDetPage] = useState(1);
  const detPageSize = 10;

  const [detSortField, setDetSortField] = useState<keyof Detection | null>(null);
  const [detSortDirection, setDetSortDirection] = useState<"asc" | "desc">("asc");

  const handleDetSort = (field: keyof Detection) => {
    if (detSortField === field) {
      setDetSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setDetSortField(field);
      setDetSortDirection("asc");
    }
  };

  const renderSortIcon = (field: keyof Detection) => {
    const isActive = detSortField === field;
    const isAsc = detSortDirection === "asc";
    return (
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginLeft: 4 }}>
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
            transition: "transform var(--transition-fast)",
            transform: isActive && !isAsc ? "rotate(180deg)" : "rotate(0deg)",
            color: isActive ? "var(--accent)" : "var(--muted)",
            opacity: isActive ? 1 : 0.45
          }}
        >
          <path d="M12 5v14" />
          <path d="m19 12-7-7-7 7" />
        </svg>
      </span>
    );
  };

  // View modal state
  const [detectionModal, setDetectionModal] = useState<{
    isOpen: boolean;
    item?: Detection;
    enterprise?: Enterprise;
  }>({ isOpen: false });

  // 1. Chart calculations
  const detectionsOverTimeData = useMemo(() => {
    const map: Record<string, number> = {};
    detections.forEach((d) => {
      const date = d.timestamp.split(" ")[0] ?? "";
      const shortDate = date.split("-").slice(1).join("/"); // MM/DD format
      map[shortDate] = (map[shortDate] ?? 0) + 1;
    });

    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [detections]);

  const detectionsByEnterpriseData = useMemo(() => {
    const map: Record<string, number> = {};
    detections.forEach((d) => {
      map[d.enterpriseName] = (map[d.enterpriseName] ?? 0) + 1;
    });

    return Object.entries(map)
      .map(([name, count]) => ({ name: name.split(" ")[0] ?? name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [detections]);

  // Unique detection categories for filters
  const detectionTypes = useMemo(() => {
    return Array.from(new Set(detections.map((d) => d.detectionType)));
  }, [detections]);

  // Resolve pending detections
  const handleReviewDetection = (det: Detection) => {
    setDetections((prev) =>
      prev.map((d) => (d.id === det.id ? { ...d, status: "Reviewed" } : d))
    );
    if (detectionModal.isOpen && detectionModal.item?.id === det.id) {
      setDetectionModal((prev) => ({
        ...prev,
        item: prev.item ? { ...prev.item, status: "Reviewed" } : undefined,
      }));
    }
    Swal.fire("Status Updated", "Detection has been marked as Reviewed.", "success");
  };

  const openDetectionDetail = (det: Detection) => {
    setDetectionModal({ isOpen: true, item: det });
  };

  // 2. Filter & paginate list
  const filteredDetections = useMemo(() => {
    return detections.filter((det) => {
      // 1. Text search
      if (detSearchQuery.trim() !== "") {
        const query = detSearchQuery.toLowerCase();
        const matchesName = det.enterpriseName.toLowerCase().includes(query);
        const matchesType = det.detectionType.toLowerCase().includes(query);
        if (!matchesName && !matchesType) return false;
      }
      // 2. Enterprise dropdown
      if (detFilterEnterprise !== "All" && det.enterpriseName !== detFilterEnterprise) {
        return false;
      }
      // 3. Category dropdown
      if (detFilterType !== "All" && det.detectionType !== detFilterType) {
        return false;
      }
      // 4. Severity dropdown
      if (detFilterSeverity !== "All" && det.severity !== detFilterSeverity) {
        return false;
      }
      // 5. Status dropdown
      if (detFilterStatus !== "All" && det.status !== detFilterStatus) {
        return false;
      }
      return true;
    });
  }, [detections, detSearchQuery, detFilterEnterprise, detFilterType, detFilterSeverity, detFilterStatus]);

  const sortedDetections = useMemo(() => {
    if (!detSortField) return filteredDetections;
    const sorted = [...filteredDetections];
    sorted.sort((a, b) => {
      const aVal = a[detSortField];
      const bVal = b[detSortField];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return detSortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return detSortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
    return sorted;
  }, [filteredDetections, detSortField, detSortDirection]);

  const paginatedDetections = useMemo(() => {
    const start = (detPage - 1) * detPageSize;
    return sortedDetections.slice(start, start + detPageSize);
  }, [sortedDetections, detPage]);

  const totalDetPages = Math.max(1, Math.ceil(filteredDetections.length / detPageSize));

  // Reset pagination on filter changes
  useEffect(() => {
    setDetPage(1);
  }, [detSearchQuery, detFilterEnterprise, detFilterType, detFilterSeverity, detFilterStatus]);

  return (
    <section className="detections-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Aggregated Feeds</p>
          <h3>Detection Event Logs</h3>
        </div>
      </div>

      {/* Chart widgets */}
      <div className="detections-charts">
        {/* Detections Timeline Chart */}
        <article className="panel-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Incident Rate</p>
              <h4>Detections Timeline</h4>
            </div>
          </div>
          <div className="detections-chart-canvas">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={detectionsOverTimeData} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDet)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Detections by Enterprise Bar Chart */}
        <article className="panel-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Enterprise Exposure</p>
              <h4>Detections by Enterprise (Top 5)</h4>
            </div>
          </div>
          <div className="detections-chart-canvas">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={detectionsByEnterpriseData} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      {/* Data Table */}
      <div className="panel-card detections-table-card">
        <div className="filter-toolbar detections-filter-grid">
          <label className="filter-control">
            <span>Search keyword</span>
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
                  color: "var(--muted)"
                }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search enterprise, type..."
                value={detSearchQuery}
                onChange={(e) => setDetSearchQuery(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
            </div>
          </label>

          <label className="filter-control">
            <span>Enterprise</span>
            <select
              value={detFilterEnterprise}
              onChange={(e) => setDetFilterEnterprise(e.target.value)}
              style={{ padding: "8px 12px", background: "#fff" }}
            >
              <option value="All">All Enterprises</option>
              {Array.from(new Set(detections.map(d => d.enterpriseName))).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>

          <label className="filter-control">
            <span>Detection Type</span>
            <select
              value={detFilterType}
              onChange={(e) => setDetFilterType(e.target.value)}
              style={{ padding: "8px 12px", background: "#fff" }}
            >
              <option value="All">All Types</option>
              {detectionTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <label className="filter-control">
            <span>Severity</span>
            <select
              value={detFilterSeverity}
              onChange={(e) => setDetFilterSeverity(e.target.value)}
              style={{ padding: "8px 12px", background: "#fff" }}
            >
              <option value="All">All Severities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </label>

          <label className="filter-control">
            <span>Status</span>
            <select
              value={detFilterStatus}
              onChange={(e) => setDetFilterStatus(e.target.value)}
              style={{ padding: "8px 12px", background: "#fff" }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed</option>
            </select>
          </label>

          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              onClick={() => {
                setDetSearchQuery("");
                setDetFilterEnterprise("All");
                setDetFilterType("All");
                setDetFilterSeverity("All");
                setDetFilterStatus("All");
                setDetSortField(null);
                setDetSortDirection("asc");
              }}
              className="filter-reset-btn"
              style={{ width: "100%", height: 38 }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="table-shell">
          <table className="detection-table">
            <thead>
              <tr>
                <th onClick={() => handleDetSort("enterpriseName")} style={{ cursor: "pointer", userSelect: "none" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    Enterprise Organization {renderSortIcon("enterpriseName")}
                  </div>
                </th>
                <th onClick={() => handleDetSort("detectionType")} style={{ cursor: "pointer", userSelect: "none" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    Detection Event Category {renderSortIcon("detectionType")}
                  </div>
                </th>
                <th onClick={() => handleDetSort("severity")} style={{ cursor: "pointer", userSelect: "none" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    Severity Rating {renderSortIcon("severity")}
                  </div>
                </th>
                <th onClick={() => handleDetSort("timestamp")} style={{ cursor: "pointer", userSelect: "none" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    Event Timestamp {renderSortIcon("timestamp")}
                  </div>
                </th>
                <th onClick={() => handleDetSort("status")} style={{ cursor: "pointer", userSelect: "none" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    Status {renderSortIcon("status")}
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDetections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state-cell">
                    No detections matched standard security filters.
                  </td>
                </tr>
              ) : (
                paginatedDetections.map((det) => (
                  <tr key={det.id} style={{ cursor: "pointer" }} onClick={() => openDetectionDetail(det)}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          color: "#475569",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "0.75rem",
                        }}>
                          {det.enterpriseLogo}
                        </div>
                        <strong>{det.enterpriseName}</strong>
                      </div>
                    </td>
                    <td>
                      <code>{det.detectionType}</code>
                    </td>
                    <td>
                      <span className={`badge ${det.severity === "High" ? "critical" : det.severity === "Medium" ? "warn" : "info"}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <span style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: det.severity === "High" ? "var(--danger)" : det.severity === "Medium" ? "var(--warning)" : "var(--info)"
                        }} />
                        {det.severity}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.85rem" }}>{det.timestamp}</span>
                    </td>
                    <td>
                      <span className={`badge ${det.status === "Reviewed" ? "healthy" : "warn"}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.75rem" }}>
                        <span style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: det.status === "Reviewed" ? "var(--success)" : "var(--warning)"
                        }} />
                        {det.status}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => openDetectionDetail(det)}
                          className="action-btn"
                          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Inspect Details
                        </button>
                        {det.status === "Pending" && (
                          <button
                            onClick={() => handleReviewDetection(det)}
                            className="action-btn"
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#10b981", background: "#f0fdf4", borderColor: "#c2f0d1" }}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Resolve / Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalDetPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
            <small style={{ color: "#64748b" }}>
              Showing Page {detPage} of {totalDetPages} ({filteredDetections.length} items)
            </small>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button
                className="filter-reset-btn"
                style={{ margin: 0, padding: "8px 12px", display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 36, height: 36 }}
                disabled={detPage === 1}
                onClick={() => setDetPage((p) => p - 1)}
                aria-label="Previous page"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              {Array.from({ length: totalDetPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setDetPage(page)}
                  className="filter-reset-btn"
                  style={{
                    margin: 0,
                    padding: 0,
                    width: 36,
                    height: 36,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 12,
                    fontWeight: 700,
                    background: detPage === page ? "var(--accent)" : "var(--accent-soft)",
                    color: detPage === page ? "#fff" : "var(--accent)",
                    borderColor: detPage === page ? "var(--accent)" : "#cfe0ff",
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                className="filter-reset-btn"
                style={{ margin: 0, padding: "8px 12px", display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 36, height: 36 }}
                disabled={detPage === totalDetPages}
                onClick={() => setDetPage((p) => p + 1)}
                aria-label="Next page"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* INSPECTOR MODAL */}
      {detectionModal.isOpen && detectionModal.item && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}>
          <div className="panel-card" style={{
            width: "100%",
            maxWidth: 600,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4)",
            border: "1px solid #cbd5e1"
          }}>
            <div className="panel-header" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 16, marginBottom: 20 }}>
              <div>
                <p className="eyebrow" style={{ color: "#3b82f6" }}>Incident Inspector</p>
                <h4>Log Event Details</h4>
              </div>
              <button
                type="button"
                className="filter-reset-btn"
                style={{ margin: 0, padding: "4px 8px" }}
                onClick={() => setDetectionModal({ isOpen: false })}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ display: "grid", gap: 20 }}>
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: 14, borderRadius: 12 }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#0f172a" }}>Event Signature</h4>
                <p style={{ margin: 0, fontSize: "0.95rem" }}>
                  <strong>Type:</strong> <code style={{ color: "#ef4444", fontSize: "1rem" }}>{detectionModal.item.detectionType}</code>
                </p>
                <p style={{ margin: "8px 0 0 0", fontSize: "0.95rem" }}>
                  <strong>Severity Rating:</strong> <span className={`badge ${detectionModal.item.severity === "High" ? "critical" : detectionModal.item.severity === "Medium" ? "warn" : "info"}`}>{detectionModal.item.severity}</span>
                </p>
              </div>

              <div>
                <h4 style={{ margin: "0 0 8px 0", color: "#0f172a" }}>Target Organization Context</h4>
                <p style={{ margin: 0 }}><strong>Company:</strong> {detectionModal.item.enterpriseName} ({detectionModal.item.enterpriseLogo})</p>
                <p style={{ margin: "6px 0 0 0" }}><strong>Authorized Representative:</strong> {detectionModal.enterprise?.contactName || "Not Onboarded"} ({detectionModal.enterprise?.contactDesignation || "N/A"})</p>
                <p style={{ margin: "6px 0 0 0" }}><strong>Corporate Email:</strong> <code>{detectionModal.enterprise?.generalEmail || "N/A"}</code></p>
              </div>

              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#0f172a" }}>Incident Metadata</h4>
                <p style={{ margin: 0 }}><strong>Timestamp:</strong> {detectionModal.item.timestamp} UTC</p>
                <p style={{ margin: "6px 0 0 0" }}>
                  <strong>Security Review Status:</strong> <span className={`badge ${detectionModal.item.status === "Reviewed" ? "healthy" : "warn"}`}>{detectionModal.item.status}</span>
                </p>
              </div>

              {detectionModal.item.status === "Pending" && (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
                  <button
                    type="button"
                    className="filter-reset-btn"
                    style={{ margin: 0 }}
                    onClick={() => setDetectionModal({ isOpen: false })}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="export-summary-btn"
                    style={{ margin: 0, backgroundColor: "#10b981" }}
                    onClick={() => {
                      handleReviewDetection(detectionModal.item!);
                    }}
                  >
                    Mark as Resolved & Reviewed
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
