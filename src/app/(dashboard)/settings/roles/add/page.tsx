"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { rolesApi, permissionsApi, handleApiError, Permission } from "@/lib/api";
import { RolePermission } from "@/lib/types";
import "../../settings.css";

// Map UI matrix to backend permission IDs
function mapMatrixToPermissionIds(
  matrix: RolePermission[],
  allPermissions: Permission[]
): string[] {
  const permissionIds: string[] = [];

  matrix.forEach(row => {
    let resources: string[] = [];
    
    // Map modules to resources
    if (row.module === "Dashboard") {
      resources = ["dashboard"];
    } else if (row.module === "Enterprises") {
      resources = ["enterprises"];
    } else if (row.module === "Detections") {
      resources = ["detections"];
    } else if (row.module === "Users") {
      resources = ["users"];
    } else if (row.module === "Roles & Permissions") {
      resources = ["roles", "permissions"];
    } else if (row.module === "Packages") {
      resources = ["packages"];
    } else if (row.module === "Billing Records") {
      resources = ["billing"];
    } else if (row.module === "Audit Logs") {
      resources = ["audit_logs"];
    }
    
    resources.forEach(resource => {
      // View = read permission
      if (row.view) {
        const perm = allPermissions.find(p => p.resource === resource && p.action === 'read');
        if (perm) permissionIds.push(perm.id);
      }
      
      // Create = create permission
      if (row.create) {
        const perm = allPermissions.find(p => p.resource === resource && p.action === 'create');
        if (perm) permissionIds.push(perm.id);
      }
      
      // Edit = update permission
      if (row.edit) {
        const perm = allPermissions.find(p => p.resource === resource && p.action === 'update');
        if (perm) permissionIds.push(perm.id);
      }
      
      // Delete = delete + manage permissions
      if (row.delete) {
        const deletePerm = allPermissions.find(p => p.resource === resource && p.action === 'delete');
        if (deletePerm) permissionIds.push(deletePerm.id);
        
        const managePerm = allPermissions.find(p => p.resource === resource && p.action === 'manage');
        if (managePerm) permissionIds.push(managePerm.id);
      }
    });
  });

  return [...new Set(permissionIds)];
}

export default function AddRolePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backendPermissions, setBackendPermissions] = useState<Permission[]>([]);

  // Form states
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<RolePermission[]>([
    { module: "Dashboard", view: false, create: false, edit: false, delete: false },
    { module: "Enterprises", view: false, create: false, edit: false, delete: false },
    { module: "Detections", view: false, create: false, edit: false, delete: false },
    { module: "Users", view: false, create: false, edit: false, delete: false },
    { module: "Roles & Permissions", view: false, create: false, edit: false, delete: false },
    { module: "Packages", view: false, create: false, edit: false, delete: false },
    { module: "Billing Records", view: false, create: false, edit: false, delete: false },
    { module: "Audit Logs", view: false, create: false, edit: false, delete: false },
  ]);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const permsResponse = await permissionsApi.list();
      if (permsResponse.ok) {
        setBackendPermissions(permsResponse.permissions);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to load permissions:", error);
      Swal.fire("Error", handleApiError(error), "error");
      setLoading(false);
    }
  };

  const handlePermissionChange = (
    moduleIndex: number,
    action: "view" | "create" | "edit" | "delete",
    val: boolean
  ) => {
    setPermissions((prev) => {
      const copy = [...prev];
      copy[moduleIndex] = { ...copy[moduleIndex], [action]: val };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roleName || !description) {
      Swal.fire("Warning", "Please enter role name and description.", "warning");
      return;
    }

    const permissionIds = mapMatrixToPermissionIds(permissions, backendPermissions);

    if (permissionIds.length === 0) {
      Swal.fire("Warning", "Please assign at least one permission.", "warning");
      return;
    }

    try {
      setSaving(true);
      const response = await rolesApi.create({
        name: roleName.toLowerCase().replace(/\s+/g, '_'),
        displayName: roleName,
        description,
        permissionIds
      });

      if (response.ok) {
        await Swal.fire("Success", `Role "${roleName}" created successfully.`, "success");
        router.push("/settings");
      }
    } catch (error) {
      console.error("Failed to create role:", error);
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
            <p className="eyebrow">Role Management</p>
            <h3>Create New Role</h3>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
          <p style={{ color: "#64748b" }}>Loading permissions...</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Role Management</p>
          <h3>Create New System Role</h3>
        </div>
        <div className="section-controls">
          <button onClick={() => router.push("/settings")} className="filter-reset-btn">
            ← Back to Settings
          </button>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-header" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 16, marginBottom: 24 }}>
          <div>
            <p className="eyebrow" style={{ color: "#3b82f6" }}>System Policy Configuration</p>
            <h4>New Role Definition</h4>
            <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "8px 0 0 0" }}>
              Define a new role with custom permissions for your dashboard users.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="department-detail-form">
          <div style={{ display: "grid", gap: 20 }}>
            <label className="filter-control">
              <span style={{ fontWeight: 600, color: "#0f172a" }}>Role Title *</span>
              <input
                type="text"
                placeholder="e.g. Risk Auditor"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
                style={{ padding: "10px 12px" }}
              />
              <small style={{ color: "#64748b", fontSize: "0.8rem" }}>
                Will be converted to lowercase_snake_case (e.g., risk_auditor)
              </small>
            </label>

            <label className="filter-control">
              <span style={{ fontWeight: 600, color: "#0f172a" }}>Description *</span>
              <textarea
                placeholder="e.g. Audits risk scores and system warnings"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                style={{ padding: "10px 12px", resize: "vertical" }}
              />
            </label>

            <div>
              <h4 style={{ color: "#0f172a", margin: "0 0 12px 0" }}>Permission Matrix</h4>
              <div className="table-shell" style={{ margin: 0 }}>
                <table style={{ margin: 0 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th>Module</th>
                      <th style={{ textAlign: "center", width: 100 }}>View</th>
                      <th style={{ textAlign: "center", width: 100 }}>Create</th>
                      <th style={{ textAlign: "center", width: 100 }}>Edit</th>
                      <th style={{ textAlign: "center", width: 100 }}>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((perm, idx) => (
                      <tr key={perm.module}>
                        <td style={{ fontWeight: 600 }}>{perm.module}</td>
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={perm.view}
                            onChange={(e) => handlePermissionChange(idx, "view", e.target.checked)}
                            style={{ cursor: "pointer", width: 18, height: 18 }}
                          />
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={perm.create}
                            onChange={(e) => handlePermissionChange(idx, "create", e.target.checked)}
                            style={{ cursor: "pointer", width: 18, height: 18 }}
                          />
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={perm.edit}
                            onChange={(e) => handlePermissionChange(idx, "edit", e.target.checked)}
                            style={{ cursor: "pointer", width: 18, height: 18 }}
                          />
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={perm.delete}
                            onChange={(e) => handlePermissionChange(idx, "delete", e.target.checked)}
                            style={{ cursor: "pointer", width: 18, height: 18 }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <small style={{ color: "#64748b", fontSize: "0.8rem", marginTop: 8, display: "block" }}>
                Select permissions for each module. Users with this role will have access to checked actions.
              </small>
            </div>
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
              onClick={() => router.push("/settings")}
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
              {saving ? "Creating Role..." : "Create Role"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
