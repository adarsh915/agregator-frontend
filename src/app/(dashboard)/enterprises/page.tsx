"use client";
import { useState } from "react";
import Link from "next/link";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type { Enterprise } from "@/lib/types";
import { enterpriseApi } from "@/lib/api";
import EnterpriseDataTable from "@/components/tables/EnterpriseDataTable";
import TableSkeleton from "@/components/ui/TableSkeleton";
import RequirePermission from "@/components/auth/RequirePermission";

export default function EnterprisesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [billingPlan, setBillingPlan] = useState('');

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['enterprises', page, limit, search, status, billingPlan],
    queryFn: async () => {
      const response = await enterpriseApi.list({ page, limit, search, status, billingPlan });
      if (!response.ok) throw new Error("Failed to load enterprises");
      return response;
    },
    placeholderData: keepPreviousData,
  });

  const loading = isLoading; // Only true on initial load, keeps old data on search

  const enterprises = data?.enterprises || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Management</p>
          <h3>Enterprises</h3>
        </div>
        <RequirePermission resource="enterprises" action="create" mode="hide">
          <Link href="/enterprises/new" className="primary-action" style={{ textDecoration: "none" }}>
            Create Enterprise
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
          {error instanceof Error ? error.message : "An error occurred"}
        </div>
      )}

      {loading ? (
        <TableSkeleton />
      ) : (
        <EnterpriseDataTable 
          data={enterprises} 
          pagination={pagination}
          onPaginationChange={(newPage, newLimit) => {
            setPage(newPage);
            setLimit(newLimit);
          }}
          onSearchChange={(newSearch) => {
            setSearch(newSearch);
            setPage(1); // Reset to page 1 on new search
          }}
          onFiltersChange={(newStatus, newBillingPlan) => {
            setStatus(newStatus || '');
            setBillingPlan(newBillingPlan || '');
            setPage(1);
          }}
        />
      )}
    </section>
  );
}
