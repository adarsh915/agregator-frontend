"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/app/(dashboard)/layout";
import { auditLogsApi, AuditLogEntry, AuditLogActor } from "@/lib/api";
import Swal from "sweetalert2";
import AuditLogsDataTable from "@/components/AuditLogsDataTable";

export default function AuditLogsPage() {
  const router = useRouter();
  const { profileRole } = useDashboard();
  
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [actors, setActors] = useState<AuditLogActor[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);

  // Filters
  const [filterAction, setFilterAction] = useState("");
  const [filterActor, setFilterActor] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // 1. Guard route: Only super_admin can view this page
  useEffect(() => {
    // Wait until profileRole is loaded
    if (profileRole === undefined) return;
    
    // In our system, the DB role name is 'super_admin' but the UI might display it as 'Super Admin'
    // check both to be safe
    const isSuperAdmin = profileRole === "Super Admin" || profileRole === "super_admin";
    if (!isSuperAdmin) {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "Only Super Admins can access the audit logs.",
      }).then(() => {
        router.replace("/");
      });
    }
  }, [profileRole, router]);

  // 2. Fetch filter options
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [actorsRes, actionsRes] = await Promise.all([
          auditLogsApi.getActors(),
          auditLogsApi.getActions()
        ]);
        if (actorsRes.success) setActors(actorsRes.data);
        if (actionsRes.success) setActions(actionsRes.data);
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    };
    if (profileRole === "Super Admin" || profileRole === "super_admin") {
      fetchFilterData();
    }
  }, [profileRole]);

  // 3. Fetch logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await auditLogsApi.list({
        page,
        limit,
        action: filterAction || undefined,
        actorId: filterActor || undefined,
        from: filterFrom ? new Date(filterFrom).toISOString() : undefined,
        to: filterTo ? new Date(filterTo).toISOString() : undefined,
      });
      if (res.success) {
        setLogs(res.data);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err: any) {
      Swal.fire("Error", err.message || "Failed to fetch logs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileRole === "Super Admin" || profileRole === "super_admin") {
      fetchLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterAction, filterActor, filterFrom, filterTo, profileRole]);

  const handleReset = () => {
    setFilterAction("");
    setFilterActor("");
    setFilterFrom("");
    setFilterTo("");
    setPage(1);
  };

  // Don't render until role check passes
  if (profileRole !== "Super Admin" && profileRole !== "super_admin") {
    return <div className="loading-state">Checking authorization...</div>;
  }

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">System</p>
          <h3>Audit Logs</h3>
        </div>
        <button className="primary-action" onClick={fetchLogs} disabled={loading} style={{ border: 'none', cursor: 'pointer' }}>
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      <AuditLogsDataTable 
        data={logs}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        actions={actions}
        actors={actors}
        filterAction={filterAction}
        setFilterAction={(val) => { setFilterAction(val); setPage(1); }}
        filterActor={filterActor}
        setFilterActor={(val) => { setFilterActor(val); setPage(1); }}
        filterFrom={filterFrom}
        setFilterFrom={(val) => { setFilterFrom(val); setPage(1); }}
        filterTo={filterTo}
        setFilterTo={(val) => { setFilterTo(val); setPage(1); }}
        limit={limit}
        onLimitChange={(val) => { setLimit(val); setPage(1); }}
        onReset={handleReset}
      />
    </section>
  );
}
