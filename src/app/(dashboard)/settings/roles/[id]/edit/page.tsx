"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import { rolesApi, permissionsApi, handleApiError, Permission, RoleResponse, RolePermissionAssignment } from "@/lib/api";
import { RolePermission } from "@/lib/types";
import "../../../settings.css";

// Map backend permissions to UI matrix format
function mapBackendPermissionsToMatrix(backendPermissions: RolePermissionAssignment[]): RolePermission[] {
  const modules = ["Dashboard", "Enterprises", "Detections", "Users", "Roles & Permissions", "Packages", "Billing Records", "Audit Logs"];
  
  const matrix: RolePermission[] = modules.map(module => ({
    module,
    view: false,
    create: false,
    edit: false,
    delete: false
  }));

  backendPermissions.forEach(perm => {
    const resource = perm.resource || "";
    const action = perm.action || "";
    
    let moduleRow: RolePermission | undefined;
    
    // Map resources to modules
    if (resource === "dashboard") {
      moduleRow = matrix.find(m => m.module === "Dashboard");
    } else if (resource === "enterprises") {
      moduleRow = matrix.find(m => m.module === "Enterprises");
    } else if (resource === "detections") {
      moduleRow = matrix.find(m => m.module === "Detections");
    } else if (resource === "users") {
      moduleRow = matrix.find(m => m.module === "Users");
    } else if (resource === "roles" || resource === "permissions") {
      moduleRow = matrix.find(m => m.module === "Roles & Permissions");
    } else if (resource === "packages") {
      moduleRow = matrix.find(m => m.module === "Packages");
    } else if (resource === "billing") {
      moduleRow = matrix.find(m => m.module === "Billing Records");
    } else if (resource === "audit_logs") {
      moduleRow = matrix.find(m => m.module === "Audit Logs");
    }
    
    if (!moduleRow) return;

    // Map actions to columns
    if (action === 'read') {
      moduleRow.view = true;
    } else if (action === 'create') {
      moduleRow.create = true;
    } else if (action === 'update') {
      moduleRow.edit = true;
    } else if (action === 'delete' || action === 'manage') {
      moduleRow.delete = true;
    }
  });

  return matrix;
}

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

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backendPermissions, setBackendPermissions] = useState<Permission[]>([]);
  const [role, setRole] = useState<RoleResponse | null>(null);

  // Form states
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<RolePermission[]>([]);

  useEffect(() => {
    loadRoleAndPermissions();
  }, [roleId]);

  const loadRoleAndPermissions = async () => {
    try {
      setLoading(true);

      // Load all permissions
      const permsResponse = await permissionsApi.list();
      if (permsResponse.ok) {
        setBackendPermissions(permsResponse.permissions);
      }

      // Load role details
      const roleResponse = await rolesApi.getById(roleId);
      if (roleResponse.ok) {
        setRole(roleResponse.role);
        setDescription(roleResponse.role.description || "");
        
        // Map backend permissions to matrix
        const matrix = mapBackendPermissionsToMatrix(roleResponse.role.permissions || []);
        setPermissions(matrix);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to load role:", error);
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

    if (!description) {
      Swal.fire("Warning", "Please enter a description.", "warning");
      return;
    }

    const permissionIds = mapMatrixToPermissionIds(permissions, backendPermissions);

    if (permissionIds.length === 0) {
      Swal.fire("Warning", "Please assign at least one permission.", "warning");
      return;
    }

    try {
      setSaving(true);

      if (!role) {
        throw new Error("Role not loaded");
      }

      // Send all required fields to match backend expectations
      const updatePayload = {
        displayName: role.displayName,  // Keep existing display name
        description: description,        // Updated description
        isActive: role.isActive !== undefined ? role.isActive : true  // Keep existing or default to true
      };
      
      const updateResult = await rolesApi.update(roleId, updatePayload);

      const permResult = await rolesApi.updatePermissions(roleId, permissionIds);

      await Swal.fire("Success", "Role permissions updated successfully.", "success");
      router.push("/settings");
    } catch (error) {
      console.error("❌ Update failed at one of the steps");
      console.error("Error:", error);
      
      // Show detailed error
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Error message:", errorMsg);
      console.error("Permission count:", permissionIds.length);
      console.error("Role ID:", roleId);
      
      Swal.fire("Error", errorMsg, "error");
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
            <h3>Edit Role Permissions</h3>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
          <p style={{ color: "#64748b" }}>Loading role...</p>
        </div>
      </section>
    );
  }

  if (!role) {
    return (
      <section>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Role Management</p>
            <h3>Edit Role Permissions</h3>
          </div>
        </div>
        <div className="panel-card">
          <p style={{ color: "#ef4444", textAlign: "center" }}>Role not found</p>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button onClick={() => router.push("/settings")} className="export-summary-btn">
              Back to Settings
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Role Management</p>
          <h3>Edit Role: {role.displayName}</h3>
        </div>
        <div className="section-controls">
          {role.isSystem && (
            <span className="badge" style={{ backgroundColor: "#3b82f6", color: "white", fontSize: "0.85rem", padding: "4px 12px" }}>
              System Role
            </span>
          )}
          <button onClick={() => router.push("/settings")} className="filter-reset-btn">
            ← Back to Settings
          </button>
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-header" style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 16, marginBottom: 24 }}>
          <div>
            <p className="eyebrow" style={{ color: "#3b82f6" }}>System Policy Configuration</p>
            <h4>Modify Role Permissions: {role.displayName}</h4>
            <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "8px 0 0 0" }}>
              Update role description and permission assignments.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="department-detail-form">
          <div style={{ display: "grid", gap: 20 }}>
            <label className="filter-control">
              <span style={{ fontWeight: 600, color: "#0f172a" }}>Role Name</span>
              <input
                type="text"
                value={role.displayName}
                disabled
                style={{ padding: "10px 12px", background: "#f1f5f9", color: "#64748b", cursor: "not-allowed" }}
              />
              <small style={{ color: "#64748b", fontSize: "0.8rem" }}>
                Role name cannot be changed
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
                Update permissions for each module. All users with this role will be affected.
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
              {saving ? "Saving Changes..." : "Save Permission Changes"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
