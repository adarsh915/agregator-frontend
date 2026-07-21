"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { packageApi, BillingPackage } from "@/lib/api";
import PackagesDataTable from "@/components/tables/PackagesDataTable";
import TableSkeleton from "@/components/ui/TableSkeleton";
import RequirePermission from "@/components/auth/RequirePermission";

export default function PackagesPage() {
  const [packages, setPackages] = useState<BillingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  
  const loadPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await packageApi.list({ includeInactive: false, page, limit, search });
      if (res.ok && res.packages) {
        setPackages(res.packages);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setError(res.error || "Failed to load packages");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, [page, limit, search]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to deactivate this package?")) return;
    
    try {
      const res = await packageApi.deactivate(id);
      if (res.ok) {
        setPackages(packages.filter((p) => p.id !== id));
      } else {
        alert(res.error || "Failed to deactivate package");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Management</p>
          <h3>Billing Packages</h3>
        </div>
        <RequirePermission resource="packages" action="create" mode="hide">
          <Link href="/packages/add" className="primary-action" style={{ textDecoration: "none" }}>
            Add Package
          </Link>
        </RequirePermission>
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

      <div className="panel-card">
        {loading ? (
          <TableSkeleton />
        ) : (
          <PackagesDataTable 
            data={packages} 
            onDelete={handleDelete}
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
      </div>
    </section>
  );
}
