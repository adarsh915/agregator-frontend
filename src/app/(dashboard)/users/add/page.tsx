"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { usersApi, rolesApi, handleApiError, RoleResponse } from "@/lib/api";
import "../users.css";

export default function AddUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backendRoles, setBackendRoles] = useState<RoleResponse[]>([]);

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const rolesResponse = await rolesApi.list();
      if (rolesResponse.ok) {
        setBackendRoles(rolesResponse.roles);
        // Pre-select first role by default
        if (rolesResponse.roles.length > 0) {
          setRoleIds([rolesResponse.roles[0].id]);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to load roles:", error);
      Swal.fire("Error", handleApiError(error), "error");
      setLoading(false);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setRoleIds(prev => {
      if (prev.includes(roleId)) {
        // Remove role (but keep at least one)
        return prev.length > 1 ? prev.filter(id => id !== roleId) : prev;
      } else {
        // Add role
        return [...prev, roleId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName || !email || !password) {
      Swal.fire("Warning", "Please complete all required fields.", "warning");
      return;
    }

    if (roleIds.length === 0) {
      Swal.fire("Warning", "Please assign at least one role.", "warning");
      return;
    }

    if (password.length < 6) {
      Swal.fire("Warning", "Password must be at least 6 characters.", "warning");
      return;
    }

    try {
      setSaving(true);
      const response = await usersApi.create({
        email,
        displayName,
        password,
        roleIds
      });

      if (response.ok) {
        await Swal.fire("Success", `Staff account for ${displayName} created.`, "success");
        router.push("/users");
      }
    } catch (error) {
      console.error("Failed to create user:", error);
      Swal.fire("Error", handleApiError(error), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">User Management</p>
            <h3>Create New Staff User</h3>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
          <p style={{ color: "#64748b" }}>Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="users-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">User Management</p>
          <h3>Create New Staff User</h3>
        </div>
        <div className="section-controls">
          <button onClick={() => router.back()} className="filter-reset-btn">
            ← Back to Users
          </button>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-header" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 16, marginBottom: 24 }}>
          <div>
            <p className="eyebrow" style={{ color: "#3b82f6" }}>Security Operations</p>
            <h4>New Staff Access Account</h4>
            <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "8px 0 0 0" }}>
              Create a new internal user account with role-based permissions.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="department-detail-form">
          <div style={{ display: "grid", gap: 20 }}>
            <label className="filter-control">
              <span style={{ fontWeight: 600, color: "#0f172a" }}>Display Name *</span>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                style={{ padding: "10px 12px" }}
              />
            </label>

            <label className="filter-control">
              <span style={{ fontWeight: 600, color: "#0f172a" }}>Corporate Email Address *</span>
              <input
                type="email"
                placeholder="e.g. john@shield.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ padding: "10px 12px" }}
              />
              <small style={{ color: "#64748b", fontSize: "0.8rem" }}>
                User will login with this email address
              </small>
            </label>

            <label className="filter-control">
              <span style={{ fontWeight: 600, color: "#0f172a" }}>Console Password *</span>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ padding: "10px 12px" }}
              />
              <small style={{ color: "#64748b", fontSize: "0.8rem" }}>
                Minimum 6 characters required
              </small>
            </label>

            <label className="filter-control">
              <span style={{ fontWeight: 600, color: "#0f172a" }}>Assign Roles * (Select one or more)</span>
              <div style={{
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: 20,
                maxHeight: 400,
                overflowY: "auto",
                background: "#fafbfc"
              }}>
                {backendRoles.length === 0 ? (
                  <p style={{ color: "#64748b", textAlign: "center", margin: 0 }}>
                    No roles available. Please create roles first.
                  </p>
                ) : (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: 16
                  }}>
                    {backendRoles.map((role) => (
                      <label
                        key={role.id}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          padding: 16,
                          border: roleIds.includes(role.id) ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                          borderRadius: 8,
                          cursor: "pointer",
                          background: roleIds.includes(role.id) ? "#eff6ff" : "#fff",
                          transition: "all 0.2s",
                          boxShadow: roleIds.includes(role.id) ? "0 2px 8px rgba(59, 130, 246, 0.1)" : "none"
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={roleIds.includes(role.id)}
                          onChange={() => handleRoleToggle(role.id)}
                          style={{ 
                            cursor: "pointer", 
                            marginTop: 2,
                            width: 18,
                            height: 18,
                            accentColor: "#3b82f6"
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <strong style={{ color: "#0f172a", fontSize: "0.95rem" }}>{role.displayName}</strong>
                            {role.isSystem && (
                              <span className="badge" style={{
                                backgroundColor: "#3b82f6",
                                color: "white",
                                fontSize: "0.65rem",
                                padding: "2px 8px",
                                borderRadius: 4
                              }}>
                                System
                              </span>
                            )}
                          </div>
                          <small style={{ color: "#64748b", fontSize: "0.85rem", display: "block", lineHeight: 1.4 }}>
                            {role.description || "No description available"}
                          </small>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ 
                marginTop: 12, 
                padding: 12, 
                background: "#f1f5f9", 
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <small style={{ color: "#475569", fontSize: "0.85rem", fontWeight: 500 }}>
                  Selected Roles: {roleIds.length}
                </small>
                <small style={{ color: "#64748b", fontSize: "0.8rem" }}>
                  User will inherit permissions from all selected roles
                </small>
              </div>
            </label>

            <label className="filter-control">
              <span style={{ fontWeight: 600, color: "#0f172a" }}>Account Status</span>
              <select
                value={isActive ? "active" : "inactive"}
                onChange={(e) => setIsActive(e.target.value === "active")}
                style={{ padding: "10px 12px", background: "#fff" }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <small style={{ color: "#64748b", fontSize: "0.8rem" }}>
                Set to Active to allow immediate login
              </small>
            </label>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            marginTop: 32,
            paddingTop: 20,
            borderTop: "1px solid #e2e8f0"
          }}>
            <button
              type="button"
              className="filter-reset-btn"
              style={{ margin: 0 }}
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="export-summary-btn"
              style={{ margin: 0 }}
              disabled={saving}
            >
              {saving ? "Creating User..." : "Create Staff User"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
