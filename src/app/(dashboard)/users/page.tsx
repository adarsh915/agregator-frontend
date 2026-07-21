"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useDashboard } from "../layout";
import { InternalUser } from "@/lib/types";
import { usersApi, rolesApi, handleApiError, UserResponse } from "@/lib/api";
import UsersDataTable from "@/components/tables/UsersDataTable";
import TableSkeleton from "@/components/ui/TableSkeleton";
import RequirePermission from "@/components/auth/RequirePermission";
import "./users.css";

export default function UsersPage() {
  const router = useRouter();
  const { profileEmail } = useDashboard();

  // Local state for users (loaded from backend)
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  // Load users and roles from backend
  useEffect(() => {
    loadUsersAndRoles();
  }, [page, limit, search]);

  const loadUsersAndRoles = async () => {
    try {
      setLoading(true);

      // Load roles first (only needed once, but safe to call)
      const rolesResponse = await rolesApi.list();

      // Load users with pagination
      console.log("Fetching users from backend with pagination...");
      const usersResponse = await usersApi.list({ page, limit, search });
      console.log("Users response:", usersResponse);

      if (usersResponse.ok) {
        if (usersResponse.pagination) {
          setPagination(usersResponse.pagination);
        }
        // Transform backend users to UI format
        const transformedUsers: InternalUser[] = usersResponse.users.map((backendUser: UserResponse) => ({
          id: backendUser.id,
          name: backendUser.displayName,
          email: backendUser.email,
          phone: "", // Phone not in backend schema yet
          role: backendUser.roles.length > 0 ? backendUser.roles[0].displayName : "No Role",
          roles: backendUser.roles.map(r => r.displayName),
          status: backendUser.isActive ? "Active" : "Inactive",
          lastLogin: backendUser.lastLoginAt || "Never Logged In"
        }));


        setUsers(transformedUsers);
      } else {
        console.error("❌ Users response not OK:", usersResponse);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to load users:", error);
      Swal.fire("Error", handleApiError(error), "error");
      setLoading(false);
    }
  };

  // Revoke user profiles
  const handleUserDelete = async (user: InternalUser) => {
    if (user.email === profileEmail) {
      Swal.fire("Forbidden", "You cannot delete your own logged-in account.", "error");
      return;
    }

    const confirm = await Swal.fire({
      title: "Remove Staff?",
      text: `Do you want to revoke system dashboard access for "${user.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Revoke Access",
    });

    if (confirm.isConfirmed) {
      try {
        // Backend doesn't have delete endpoint, so we'll deactivate instead
        await usersApi.update(user.id, { isActive: false });
        await loadUsersAndRoles();
        Swal.fire("Deactivated", "User account deactivated.", "success");
      } catch (error) {
        console.error("Failed to delete user:", error);
        Swal.fire("Error", handleApiError(error), "error");
      }
    }
  };


  return (
    <section className="users-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Access Controls</p>
          <h3>Internal Dashboard Staff</h3>
        </div>
        <div className="section-controls">
          <RequirePermission resource="users" action="create" mode="hide">
            <button onClick={() => router.push("/users/add")} className="export-summary-btn">
              + Add Staff User
            </button>
          </RequirePermission>
        </div>
      </div>

      <div className="panel-card">
        {loading ? (
          <TableSkeleton />
        ) : (
          <UsersDataTable 
            data={users} 
            currentUserEmail={profileEmail}
            onEdit={(user) => router.push(`/users/${user.id}/edit`)}
            onDelete={handleUserDelete}
            pagination={pagination}
            onPaginationChange={(newPage, newLimit) => {
              setPage(newPage);
              setLimit(newLimit);
            }}
            onSearchChange={(newSearch) => {
              setSearch(newSearch);
              setPage(1);
            }}
          />
        )}
      </div>
    </section>
  );
}
