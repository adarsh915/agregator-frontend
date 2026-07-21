"use client";

import { useEffect, useState, useCallback } from "react";
import { API_BASE_URL, getAuthToken } from "./api/client";

interface PermissionState {
  permissions: string[];
  role: string;
  loading: boolean;
}

// C-2 fix: permissions are fetched from the backend on every app load,
// not read from localStorage where any user can edit them in DevTools.
// localStorage is still used as a fast-path cache for the initial render,
// but the backend is always the authoritative source and overwrites it.
export function usePermissions() {
  const [state, setState] = useState<PermissionState>({
    permissions: [],
    role: '',
    loading: true,
  });

  useEffect(() => {
    // Step 1: seed from localStorage immediately so the UI doesn't flash
    // on the loading skeleton for users who just logged in.
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (Array.isArray(user.permissions) && user.role) {
          setState({ permissions: user.permissions, role: user.role, loading: true });
        }
      }
    } catch {
      // Ignore parse errors — we'll get the truth from the backend below.
    }

    // Step 2: always fetch the authoritative permissions from the backend.
    // This overwrites whatever was in localStorage, preventing a client from
    // granting themselves extra permissions by editing localStorage.
    const token = getAuthToken();
    if (!token) {
      setState({ permissions: [], role: '', loading: false });
      return;
    }

    fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        const profile = data.profile;
        const permissions: string[] = Array.isArray(profile.permissions) ? profile.permissions : [];
        const role: string = profile.role || '';

        // Update localStorage cache with fresh server data
        try {
          const userStr = localStorage.getItem("user");
          const user = userStr ? JSON.parse(userStr) : {};
          localStorage.setItem("user", JSON.stringify({ ...user, permissions, role }));
        } catch {
          // Ignore
        }

        setState({ permissions, role, loading: false });
      })
      .catch(() => {
        // If the server call fails (network issue, expired token), fall back
        // to whatever was already seeded from localStorage but stop loading.
        setState((prev) => ({ ...prev, loading: false }));
      });
  }, []);

  // Check if the current user has a specific permission
  // Example: hasPermission('users', 'update')
  const hasPermission = useCallback((resource: string, action: string): boolean => {
    // Super Admins have all permissions implicitly
    if (state.role === 'Super Admin' || state.role === 'super_admin') {
      return true;
    }
    // A "manage" permission on a resource implies all other actions on it
    return (
      state.permissions.includes(`${resource}.${action}`) ||
      state.permissions.includes(`${resource}.manage`)
    );
  }, [state.role, state.permissions]);

  return { permissions: state.permissions, role: state.role, hasPermission, loading: state.loading };
}
