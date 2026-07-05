"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { enterpriseApi, usersApi } from "@/lib/api";
import type { Enterprise } from "@/lib/types";
import "./overview.css";

const COLORS = ["#3b82f6", "#10b981", "#6366f1", "#f59e0b"];

export default function OverviewPage() {
  const router = useRouter();
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersCount, setUsersCount] = useState({ active: 0, total: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load enterprises
      const entResponse = await enterpriseApi.list();
      if (entResponse.ok) {
        setEnterprises(entResponse.enterprises || []);
      }

      // Load users count
      const usersResponse = await usersApi.list();
      if (usersResponse.ok) {
        const users = usersResponse.users || [];
        setUsersCount({
          active: users.filter(u => u.isActive).length,
          total: users.length
        });
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Monthly Recurring Revenue
  const totalRevenueVal = useMemo(() => {
    return enterprises
      .filter((ent) => ent.status === "active")
      .reduce((sum, ent) => {
        // Convert to monthly equivalent
        let monthlyAmount = ent.billingAmount;
        if (ent.billingCycle === "yearly") {
          monthlyAmount = ent.billingAmount / 12;
        } else if (ent.billingCycle === "quarterly") {
          monthlyAmount = ent.billingAmount / 3;
        }
        return sum + monthlyAmount;
      }, 0);
  }, [enterprises]);

  // Count active enterprises
  const activeEntCount = useMemo(() => {
    return enterprises.filter((ent) => ent.status === "active").length;
  }, [enterprises]);

  // Count suspended enterprises
  const suspendedEntCount = useMemo(() => {
    return enterprises.filter((ent) => ent.status === "suspended").length;
  }, [enterprises]);

  // Count inactive enterprises
  const inactiveEntCount = useMemo(() => {
    return enterprises.filter((ent) => ent.status === "inactive").length;
  }, [enterprises]);

  // Package Distribution
  const planDistributionData = useMemo(() => {
    const counts = { starter: 0, professional: 0, enterprise: 0 };
    enterprises.forEach((ent) => {
      if (ent.billingPlan && ent.billingPlan in counts) {
        counts[ent.billingPlan as keyof typeof counts]++;
      }
    });
    return [
      { name: "Starter", value: counts.starter },
      { name: "Professional", value: counts.professional },
      { name: "Enterprise", value: counts.enterprise },
    ];
  }, [enterprises]);

  // Revenue by Package
  const revenueByPackage = useMemo(() => {
    const revenue = { starter: 0, professional: 0, enterprise: 0 };
    enterprises
      .filter(ent => ent.status === "active")
      .forEach((ent) => {
        let monthlyAmount = ent.billingAmount;
        if (ent.billingCycle === "yearly") {
          monthlyAmount = ent.billingAmount / 12;
        } else if (ent.billingCycle === "quarterly") {
          monthlyAmount = ent.billingAmount / 3;
        }
        
        if (ent.billingPlan && ent.billingPlan in revenue) {
          revenue[ent.billingPlan as keyof typeof revenue] += monthlyAmount;
        }
      });
    return [
      { name: "Starter", revenue: revenue.starter },
      { name: "Professional", revenue: revenue.professional },
      { name: "Enterprise", revenue: revenue.enterprise },
    ];
  }, [enterprises]);

  if (loading) {
    return (
      <section>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
          <p style={{ color: "#64748b" }}>Loading dashboard...</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="stats-grid">
        <article className="stat-card">
          <span>Monthly Recurring Revenue</span>
          <strong>₹{Math.round(totalRevenueVal).toLocaleString("en-IN")}</strong>
          <p>From {activeEntCount} active subscriptions</p>
        </article>

        <article className="stat-card">
          <span>Total Enterprises</span>
          <strong>{enterprises.length}</strong>
          <p>
            {activeEntCount} active, {inactiveEntCount} inactive, {suspendedEntCount} suspended
          </p>
        </article>

        <article className="stat-card">
          <span>Package Distribution</span>
          <strong>
            {planDistributionData.find(p => p.name === "Enterprise")?.value || 0} Premium
          </strong>
          <p>
            {planDistributionData.find(p => p.name === "Professional")?.value || 0} pro, {" "}
            {planDistributionData.find(p => p.name === "Starter")?.value || 0} starter
          </p>
        </article>

        <article className="stat-card">
          <span>Active Operator Staff</span>
          <strong>
            {usersCount.active} / {usersCount.total}
          </strong>
          <p>Aggregator console users</p>
        </article>
      </div>

      {/* Charts Grid */}
      <div className="dashboard-grid two-column" style={{ marginBottom: 24 }}>
        {/* Revenue by Package */}
        <article className="panel-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Revenue Breakdown</p>
              <h4>Monthly Revenue by Package</h4>
            </div>
          </div>
          <div style={{ width: "100%", height: 280, padding: "20px 0" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByPackage}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={(tick) => `₹${(tick / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [
                    `₹${Math.round(Number(value || 0)).toLocaleString("en-IN")}`,
                    "Monthly Revenue",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Package Distribution Pie Chart */}
        <article className="panel-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Tier Distribution</p>
              <h4>Enterprise Packages</h4>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              height: 280,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div style={{ width: "50%", height: "100%", minWidth: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {planDistributionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {planDistributionData.map((entry, index) => (
                <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {entry.name}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

      {/* Bottom Row - Enterprise Lists */}
      <div className="dashboard-grid two-column">
        {/* Recent Enterprises */}
        <article className="panel-card">
          <div
            className="panel-header"
            style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}
          >
            <div>
              <p className="eyebrow">Recent Onboardings</p>
              <h4>Latest Enterprises</h4>
            </div>
            <button 
              onClick={() => router.push("/enterprises")} 
              className="secondary-action"
              style={{ textDecoration: "none" }}
            >
              View All
            </button>
          </div>
          <div className="table-shell" style={{ border: "none" }}>
            {enterprises.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                No enterprises yet
              </div>
            ) : (
              <table style={{ margin: 0 }}>
                <tbody>
                  {enterprises.slice(0, 5).map((ent) => (
                    <tr key={ent.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 8,
                              backgroundColor: "#eff6ff",
                              border: "1px solid #dbeafe",
                              color: "#1e40af",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: "0.85rem",
                            }}
                          >
                            {ent.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <strong>{ent.name}</strong>
                            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                              {ent.hqCity || "N/A"}, {ent.hqState || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge info" style={{ textTransform: "capitalize" }}>
                          {ent.billingPlan}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            ent.status === "active"
                              ? "healthy"
                              : ent.status === "suspended"
                              ? "critical"
                              : "warn"
                          }`}
                          style={{ textTransform: "capitalize" }}
                        >
                          {ent.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </article>

        {/* Top Revenue Enterprises */}
        <article className="panel-card">
          <div
            className="panel-header"
            style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}
          >
            <div>
              <p className="eyebrow">Revenue Leaders</p>
              <h4>Top Billing Enterprises</h4>
            </div>
            <button 
              onClick={() => router.push("/enterprises")} 
              className="secondary-action"
              style={{ textDecoration: "none" }}
            >
              View All
            </button>
          </div>
          <div className="table-shell" style={{ border: "none" }}>
            {enterprises.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                No enterprises yet
              </div>
            ) : (
              <table style={{ margin: 0 }}>
                <tbody>
                  {enterprises
                    .filter(ent => ent.status === "active")
                    .sort((a, b) => b.billingAmount - a.billingAmount)
                    .slice(0, 5)
                    .map((ent) => (
                      <tr key={ent.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                backgroundColor: "#f0fdf4",
                                border: "1px solid #bbf7d0",
                                color: "#15803d",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "0.85rem",
                              }}
                            >
                              {ent.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <strong>{ent.name}</strong>
                              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                                {ent.contactName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ textAlign: "right" }}>
                            <strong style={{ color: "#10b981" }}>
                              ₹{ent.billingAmount.toLocaleString("en-IN")}
                            </strong>
                            <div style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "capitalize" }}>
                              {ent.billingCycle}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
