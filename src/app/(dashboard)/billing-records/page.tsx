"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { billingRecordsApi, enterpriseApi } from "@/lib/api";
import type { BillingRecord, BillingStats, Enterprise } from "@/lib/types";
import BillingRecordsDataTable from "@/components/tables/BillingRecordsDataTable";
import TableSkeleton from "@/components/ui/TableSkeleton";

export default function BillingRecordsPage() {
  const [records, setRecords] = useState<BillingRecord[]>([]);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [enterpriseFilter, setEnterpriseFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load billing records
      const filters: any = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (enterpriseFilter !== "all") filters.enterpriseId = enterpriseFilter;
      filters.page = page;
      filters.limit = limit;
      if (search) filters.search = search;

      const recordsRes = await billingRecordsApi.getAll(filters);
      if (recordsRes.ok && recordsRes.records) {
        setRecords(recordsRes.records);
        if (recordsRes.pagination) setPagination(recordsRes.pagination);
      } else {
        setError(recordsRes.error || "Failed to load billing records");
      }

      // Load statistics
      const statsRes = await billingRecordsApi.getStats();
      if (statsRes.ok && statsRes.stats) {
        setStats(statsRes.stats);
      }

      // Load enterprises for filter dropdown
      const enterprisesRes = await enterpriseApi.list();
      if (enterprisesRes.ok && enterprisesRes.enterprises) {
        setEnterprises(enterprisesRes.enterprises);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, enterpriseFilter, page, limit, search]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Finance</p>
          <h3>Billing Records</h3>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div className="panel-card" style={{ padding: "20px" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", marginBottom: "8px" }}>Total Revenue</p>
            <h2 style={{ fontSize: "1.75rem", fontWeight: "bold", color: "var(--text-primary)", margin: 0 }}>
              {formatCurrency(stats.totalRevenue || 0)}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              {stats.totalRecords || 0} total records
            </p>
          </div>

          <div className="panel-card" style={{ padding: "20px" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", marginBottom: "8px" }}>Paid Amount</p>
            <h2 style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#10b981", margin: 0 }}>
              {formatCurrency(stats.paidAmount || 0)}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              {stats.paidRecords || 0} paid records
            </p>
          </div>

          <div className="panel-card" style={{ padding: "20px" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", marginBottom: "8px" }}>Pending Amount</p>
            <h2 style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#f59e0b", margin: 0 }}>
              {formatCurrency(stats.pendingAmount || 0)}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              {stats.pendingRecords || 0} pending records
            </p>
          </div>

          <div className="panel-card" style={{ padding: "20px" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", marginBottom: "8px" }}>Overdue Amount</p>
            <h2 style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#ef4444", margin: 0 }}>
              {formatCurrency(stats.overdueAmount || 0)}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              {stats.overdueRecords || 0} overdue records
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="panel-card" style={{ padding: "16px", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-light)",
                fontSize: "0.9rem"
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ flex: "1 1 200px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
              Enterprise
            </label>
            <select
              value={enterpriseFilter}
              onChange={(e) => setEnterpriseFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-light)",
                fontSize: "0.9rem"
              }}
            >
              <option value="all">All Enterprises</option>
              {enterprises.map((ent) => (
                <option key={ent.id} value={ent.id}>
                  {ent.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setStatusFilter("all");
              setEnterpriseFilter("all");
              setSearch("");
              setPage(1);
            }}
            className="filter-reset-btn"
            style={{ marginTop: "auto" }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: "16px",
          marginBottom: "20px",
          backgroundColor: "#fee",
          color: "#c00",
          borderRadius: "8px",
          border: "1px solid #fcc"
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <TableSkeleton />
      ) : (
        <BillingRecordsDataTable 
          records={records} 
          onRefresh={loadData}
          pagination={pagination}
          onPaginationChange={(newPage, newLimit) => {
            setPage(newPage);
            setLimit(newLimit);
          }}
          onSearchChange={(newSearch) => {
            setSearch(newSearch);
            setPage(1);
          }}
        />
      )}
    </section>
  );
}
