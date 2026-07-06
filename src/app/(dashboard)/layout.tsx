"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Enterprise, Detection, InternalUser, Role, NotificationItem } from "@/lib/types";
import { INITIAL_ENTERPRISES, INITIAL_DETECTIONS, INITIAL_USERS, INITIAL_ROLES, INITIAL_NOTIFICATIONS } from "@/lib/data";

interface DashboardContextType {
  // Core States
  enterprises: Enterprise[];
  setEnterprises: React.Dispatch<React.SetStateAction<Enterprise[]>>;
  detections: Detection[];
  setDetections: React.Dispatch<React.SetStateAction<Detection[]>>;
  users: InternalUser[];
  setUsers: React.Dispatch<React.SetStateAction<InternalUser[]>>;
  roles: Role[];
  setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;

  // Layout States
  desktopSidebarOpen: boolean;
  setDesktopSidebarOpen: (open: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  profileDropdownOpen: boolean;
  setProfileDropdownOpen: (open: boolean) => void;
  sidebarSettingsOpen: boolean;
  setSidebarSettingsOpen: (open: boolean) => void;
  settingsTab: string;
  setSettingsTab: (tab: string) => void;

  // Profile Info States
  profileName: string;
  setProfileName: (name: string) => void;
  profileEmail: string;
  setProfileEmail: (email: string) => void;
  profilePhone: string;
  setProfilePhone: (phone: string) => void;
  profileRole: string;
  setProfileRole: (role: string) => void;
  currentPassword: string;
  setCurrentPassword: (pw: string) => void;
  newPassword: string;
  setNewPassword: (pw: string) => void;
  confirmPassword: string;
  setConfirmPassword: (pw: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const [enterprises, setEnterprises] = useState<Enterprise[]>(INITIAL_ENTERPRISES);
  const [detections, setDetections] = useState<Detection[]>(INITIAL_DETECTIONS);
  const [users, setUsers] = useState<InternalUser[]>(INITIAL_USERS);
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [sidebarSettingsOpen, setSidebarSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<string>("roles");

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileRole, setProfileRole] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      const userStr = localStorage.getItem("user");
      
      if (!token || !userStr) {
        // Not authenticated, redirect to login
        router.replace("/login");
        return;
      }

      // Authenticated, load user profile
      try {
        const user = JSON.parse(userStr);
        if (user.displayName) setProfileName(user.displayName);
        if (user.email) setProfileEmail(user.email);
        if (user.role) setProfileRole(user.role);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Failed to load user profile from storage", err);
        // Invalid user data, redirect to login
        router.replace("/login");
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #e2e8f0",
            borderTop: "4px solid #3b82f6",
            borderRadius: "50%",
            margin: "0 auto 16px"
          }}></div>
          <p style={{ color: "#64748b" }}>Loading...</p>
        </div>

      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardContext.Provider
      value={{
        enterprises,
        setEnterprises,
        detections,
        setDetections,
        users,
        setUsers,
        roles,
        setRoles,
        notifications,
        setNotifications,
        desktopSidebarOpen,
        setDesktopSidebarOpen,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        notificationsOpen,
        setNotificationsOpen,
        profileDropdownOpen,
        setProfileDropdownOpen,
        sidebarSettingsOpen,
        setSidebarSettingsOpen,
        settingsTab,
        setSettingsTab,
        profileName,
        setProfileName,
        profileEmail,
        setProfileEmail,
        profilePhone,
        setProfilePhone,
        profileRole,
        setProfileRole,
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
      }}
    >
      <AppShell>{children}</AppShell>
    </DashboardContext.Provider>
  );
}
