"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { packageApi, BillingPackage } from "@/lib/api";
import PackagesDataTable from "@/components/PackagesDataTable";

export default function PackagesPage() {
  const [packages, setPackages] = useState<BillingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const loadPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await packageApi.list(false);
      if (res.ok && res.packages) {
        setPackages(res.packages);
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
  }, []);

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
        <Link href="/packages/add" className="primary-action" style={{ textDecoration: "none" }}>
          Add Package
        </Link>
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
        <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
      ) : (
        <PackagesDataTable packages={packages} onDelete={handleDelete} onRefresh={loadPackages} />
      )}
    </section>
  );
}
