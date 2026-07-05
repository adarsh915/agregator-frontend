"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Enterprise } from "@/lib/types";
import { enterpriseApi } from "@/lib/api";
import EnterpriseDataTable from "@/components/EnterpriseDataTable";

export default function EnterprisesPage() {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEnterprises();
  }, []);

  const loadEnterprises = async () => {
    try {
      setError(null);
      const data = await enterpriseApi.list();
      if (data.ok) {
        setEnterprises(data.enterprises || []);
      } else {
        setError("Failed to load enterprises");
      }
    } catch (err) {
      console.error("Error loading enterprises:", err);
      setError(err instanceof Error ? err.message : "Failed to load enterprises");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Management</p>
          <h3>Enterprises</h3>
        </div>
        <Link href="/enterprises/new" className="primary-action" style={{ textDecoration: "none" }}>
          Create Enterprise
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
        <EnterpriseDataTable data={enterprises} />
      )}
    </section>
  );
}
