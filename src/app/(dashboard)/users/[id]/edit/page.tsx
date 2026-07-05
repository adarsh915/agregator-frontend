"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import { usersApi, rolesApi, handleApiError, RoleResponse, UserResponse } from "@/lib/api";
import "../../users.css";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backendRoles, setBackendRoles] = useState<RoleResponse[]>([]);
  const [user, setUser] = useState<UserResponse | null>(null);

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadUserAndRoles();
  }, [userId]);

  const loadUserAndRoles = async () => {
    try {
      setLoading(true);

      // Load roles
      const rolesResponse = await rolesApi.list();
      if (rolesResponse.ok) {
        setBackendRoles(rolesResponse.roles);
      }

      // Load user
      const userResponse = await usersApi.getById(userId);
      if (userResponse.ok) {
        setUser(userResponse.user);
        setDisplayName(userResponse.user.displayName);
        setEmail(userResponse.user.email);
        setIsActive(userResponse.user.isActive);
        setRoleIds(userResponse.user.roles.map(r => r.id));
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to load user:", error);
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

    if (!displayName) {
      Swal.fire("Warning", "Display name is required.", "warning");
      return;
    }

    if (roleIds.length === 0) {
      Swal.fire("Warning", "Please assign at least one role.", "warning");
      return;
    }

    if (password && password.length < 6) {
      Swal.fire("Warning", "Password must be at least 6 characters if provided.", "warning");
      return;
    }

    try {
      setSaving(true);

      // Update user details
      const updateData: any = {
        displayName,
        isActive
      };

      if (password) {
        updateData.password = password;
      }

      const response = await usersApi.update(userId, updateData);

      if (response.ok) {
        // Update roles separately
        await usersApi.setRoles(userId, roleIds);
        await Swal.fire("Success", "Staff account updated successfully.", "success");
        router.push("/users");
      }
    } catch (error) {
      console.error("Failed to update user:", error);
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
            <h3>Edit Staff User</h3>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
          <p style={{ color: "#64748b" }}>Loading user...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">User Management</p>
            <h3>Edit Staff User</h3>
          </div>
        </div>
        <div className="panel-card">
          <p style={{ color: "#ef4444", textAlign: "center" }}>User not found</p>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button onClick={() => router.push("/users")} className="export-summary-btn">
              Back to Users
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="users-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">User Management</p>
          <h3>Edit Staff User</h3>
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
            <h4>Modify Staff Account: {user.displayName}</h4>
            <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "8px 0 0 0" }}>
              Update user details and role assignments.
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
              <span style={{ fontWeight: 600, color: "#0f172a" }}>Email Address</span>
              <input
                type="email"
                value={email}
                disabled
                style={{ padding: "10px 12px", background: "#f1f5f9", color: "#64748b", cursor: "not-allowed" }}
              />
              <small style={{ color: "#64748b", fontSize: "0.8rem" }}>
                Email address cannot be changed
              </small>
            </label>

            <label className="filter-control">
              <span style={{ fontWeight: 600, color: "#0f172a" }}>Reset Password (Optional)</span>
              <input
                type="password"
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                style={{ padding: "10px 12px" }}
              />
              <small style={{ color: "#64748b", fontSize: "0.8rem" }}>
                Only fill if you want to change the password (minimum 6 characters)
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
                    No roles available.
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
                Inactive users cannot login
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
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
