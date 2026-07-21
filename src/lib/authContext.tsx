"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { API_BASE_URL, getAuthToken } from "./api/client";

export type AuthStatus = "loading" | "ready" | "error";

interface AuthState {
  permissions: string[];
  role: string;
  user: any | null;
  status: AuthStatus;
}

interface AuthContextType extends AuthState {
  hasPermission: (resource: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    permissions: [],
    role: "",
    user: null,
    status: "loading",
  });

  useEffect(() => {
    let hasCache = false;

    // 1. Check local storage cache for instant rendering
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (Array.isArray(user.permissions) && user.role) {
          setState({
            permissions: user.permissions,
            role: user.role,
            user,
            status: "ready", // Instant render from cache
          });
          hasCache = true;
        }
      }
    } catch {
      // Ignore cache parsing errors
    }

    // 2. Fetch authoritative data from backend (stale-while-revalidate)
    const token = getAuthToken();
    if (!token) {
      setState({ permissions: [], role: "", user: null, status: "error" });
      return;
    }

    if (!hasCache) {
      setState((prev) => ({ ...prev, status: "loading" }));
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
        const role: string = profile.role || "";

        try {
          const userStr = localStorage.getItem("user");
          const user = userStr ? JSON.parse(userStr) : {};
          const updatedUser = { ...user, permissions, role };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setState({ permissions, role, user: updatedUser, status: "ready" });
        } catch {
          setState({ permissions, role, user: profile, status: "ready" });
        }
      })
      .catch((err) => {
        console.error("Auth sync error:", err);
        if (!hasCache) {
          setState((prev) => ({ ...prev, status: "error" }));
        }
      });
  }, []);

  const hasPermission = useCallback(
    (resource: string, action: string): boolean => {
      if (state.role === "Super Admin" || state.role === "super_admin") {
        return true;
      }
      return (
        state.permissions.includes(`${resource}.${action}`) ||
        state.permissions.includes(`${resource}.manage`)
      );
    },
    [state.role, state.permissions]
  );

  return (
    <AuthContext.Provider value={{ ...state, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
