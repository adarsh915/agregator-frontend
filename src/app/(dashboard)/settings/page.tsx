"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useDashboard } from "../layout";
import { Role } from "@/lib/types";
import { rolesApi, permissionsApi, usersApi, Permission, RoleResponse, handleApiError } from "@/lib/api";
import "./settings.css";

export default function SettingsPage() {
  const router = useRouter();
  const {
    roles,
    setRoles,
    users,
    setUsers,
    settingsTab,
    setSettingsTab
  } = useDashboard();

  // API States
  const [loading, setLoading] = useState(true);
  const [backendPermissions, setBackendPermissions] = useState<Permission[]>([]);
  const [backendRoleIdMap, setBackendRoleIdMap] = useState<Map<string, string>>(new Map()); // displayName -> roleId mapping

  // Load roles and permissions from backend
  useEffect(() => {
    loadRolesAndPermissions();
  }, []);

  const loadRolesAndPermissions = async () => {
    try {
      setLoading(true);
      
      // Load permissions
      const permsResponse = await permissionsApi.list();
      if (permsResponse.ok) {
        setBackendPermissions(permsResponse.permissions);
      }

      // Load roles (without full permission details for list view)
      const rolesResponse = await rolesApi.list();
      if (rolesResponse.ok) {
        // Build role ID map
        const idMap = new Map<string, string>();
        rolesResponse.roles.forEach((role) => {
          idMap.set(role.displayName, role.id);
        });
        setBackendRoleIdMap(idMap);

        // Transform backend roles to UI format
        const transformedRoles: Role[] = rolesResponse.roles.map((backendRole: RoleResponse) => ({
          id: parseInt(backendRole.id.substring(0, 8), 16), // Convert UUID to number for UI
          name: backendRole.displayName,
          description: backendRole.description || "",
          permissions: [], // Empty permissions for list view
          isSystem: backendRole.isSystem
        }));

        setRoles(transformedRoles);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to load roles:", error);
      Swal.fire("Error", handleApiError(error), "error");
      setLoading(false);
    }
  };

  // Delete roles
  const handleRoleDelete = async (role: Role) => {
    // Check if it's a system role
    if (role.isSystem) {
      Swal.fire({
        title: "System Role Protected",
        text: `The role "${role.name}" is a system role and cannot be deleted. System roles are essential for the platform's security and functionality.`,
        icon: "error",
      });
      return;
    }

    const isAssigned = users.some((u) => u.role === role.name);

    if (isAssigned) {
      Swal.fire({
        title: "Role in Use",
        text: `The role "${role.name}" is currently assigned to active staff members. You must reassign those users before deleting this role.`,
        icon: "error",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Remove Role?",
      text: `Do you want to permanently delete the role "${role.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Delete Role",
    });

    if (confirm.isConfirmed) {
      try {
        // Get backend role ID
        const backendRoleId = backendRoleIdMap.get(role.name);

        if (backendRoleId) {
          await rolesApi.delete(backendRoleId);
          await loadRolesAndPermissions();
          Swal.fire("Deleted", "System permissions removed.", "success");
        }
      } catch (error) {
        console.error("Failed to delete role:", error);
        Swal.fire("Error", handleApiError(error), "error");
      }
    }
  };

  if (loading) {
    return (
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Configuration</p>
            <h3>System Settings</h3>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
          <p style={{ color: "#64748b" }}>Loading roles and permissions...</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Configuration</p>
          <h3>System Settings</h3>
        </div>
      </div>

      {/* Tab Header bar */}
      <div className="section-controls" style={{ justifyContent: "flex-start", gap: 12, borderBottom: "1px solid #e2e8f0", paddingBottom: 12, marginBottom: 24 }}>
        <button
          type="button"
          className={`filter-chip ${settingsTab === "roles" ? "active" : ""}`}
          onClick={() => setSettingsTab("roles")}
        >
          Role Matrix Management
        </button>
        <button
          type="button"
          className={`filter-chip ${settingsTab === "notifications" ? "active" : ""}`}
          onClick={() => setSettingsTab("notifications")}
        >
          Notifications config
        </button>
        <button
          type="button"
          className={`filter-chip ${settingsTab === "billing" ? "active" : ""}`}
          onClick={() => setSettingsTab("billing")}
        >
          Billing Settings
        </button>
        <button
          type="button"
          className={`filter-chip ${settingsTab === "integrations" ? "active" : ""}`}
          onClick={() => setSettingsTab("integrations")}
        >
          Integrations (API)
        </button>
      </div>

      {/* TAB CONTENT: ROLE MATRIX */}
      {settingsTab === "roles" && (
        <div className="panel-card">
          <div className="panel-header" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 16, marginBottom: 20 }}>
            <div>
              <p className="eyebrow">Permissions</p>
              <h4>Roles Permission Grid</h4>
            </div>
            <button onClick={() => router.push("/settings/roles/add")} className="export-summary-btn">
              + Create New Role
            </button>
          </div>

          <div style={{ display: "grid", gap: 24 }}>
            {roles.map((role) => {
              const countAssigned = users.filter((u) => u.role === role.name).length;
              return (
                <article key={role.id} className="role-article-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>{role.name}</strong>
                        {role.isSystem && (
                          <span className="badge" style={{ backgroundColor: "#3b82f6", color: "white", fontSize: "0.7rem", padding: "2px 8px" }}>
                            System Role
                          </span>
                        )}
                        <span className="badge healthy" style={{ marginLeft: 0, fontSize: "0.75rem" }}>
                          {countAssigned} Active Users Assigned
                        </span>
                      </div>
                      <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>{role.description}</p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button 
                        onClick={() => {
                          const backendRoleId = backendRoleIdMap.get(role.name);
                          if (backendRoleId) {
                            router.push(`/settings/roles/${backendRoleId}/edit`);
                          }
                        }} 
                        className="action-btn"
                      >
                        Edit Permissions
                      </button>
                      <button
                        onClick={() => handleRoleDelete(role)}
                        className="action-btn danger"
                        disabled={countAssigned > 0 || role.isSystem}
                        title={
                          role.isSystem 
                            ? "System roles cannot be deleted" 
                            : countAssigned > 0 
                            ? "Cannot delete role while assigned to active users." 
                            : ""
                        }
                        style={{
                          opacity: (countAssigned > 0 || role.isSystem) ? 0.4 : 1,
                          cursor: (countAssigned > 0 || role.isSystem) ? "not-allowed" : "pointer"
                        }}
                      >
                        Delete Role
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* PLACEHOLDER TABS */}
      {settingsTab !== "roles" && (
        <article className="panel-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280, textAlign: "center" }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            backgroundColor: "#eff6ff",
            color: "#3b82f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 30, height: 30 }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h4 style={{ color: "#0f172a", marginBottom: 6 }}>Module Under Development</h4>
          <p style={{ color: "#64748b", margin: 0, maxWidth: 380, fontSize: "0.9rem" }}>
            The "{settingsTab.toUpperCase()}" settings segment is planned for the final build release. Permissions matrix configuration is active.
          </p>
        </article>
      )}
    </section>
  );
}
