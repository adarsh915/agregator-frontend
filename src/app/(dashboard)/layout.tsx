"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import AppShell from "@/components/ui/AppShell";
import AppShellSkeleton from "@/components/ui/AppShellSkeleton";
import { AuthProvider, useAuth } from "@/lib/authContext";
import Swal from "sweetalert2";
import { Detection, NotificationItem } from "@/lib/types";
import { INITIAL_DETECTIONS, INITIAL_NOTIFICATIONS } from "@/lib/data";

interface DashboardContextType {
  // Core States
  detections: Detection[];
  setDetections: React.Dispatch<React.SetStateAction<Detection[]>>;
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

function DashboardLayoutInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { hasPermission, status } = useAuth();
  const permissionsLoading = status === "loading";
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isRouteAuthorized, setIsRouteAuthorized] = useState(false);

  const [detections, setDetections] = useState<Detection[]>(INITIAL_DETECTIONS);
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

  // Show loading state while checking authentication or permissions
  if (isChecking || permissionsLoading) {
    return <AppShellSkeleton />;
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Route Guard Logic (Run once authenticated)
  const routePermissions: Record<string, { resource: string, action: string }> = {
    '/enterprises': { resource: 'enterprises', action: 'read' },
    '/users': { resource: 'users', action: 'read' },
    '/packages': { resource: 'packages', action: 'read' },
    '/settings': { resource: 'roles', action: 'read' },
    '/billing-records': { resource: 'billing', action: 'read' },
    '/detections': { resource: 'detections', action: 'read' },
    '/audit-logs': { resource: 'audit_logs', action: 'read' },
  };

  // Evaluate route permission synchronously during render to avoid flashing unauthorized content
  let isAuthorized = true;
  if (pathname === '/' && !hasPermission('dashboard', 'read')) {
    isAuthorized = false;
    // Delay redirect to avoid Next.js render-phase router errors
    setTimeout(() => {
      Swal.fire({ toast: true, position: 'top-end', text: 'You do not have permission to view the Dashboard.', icon: 'error', showConfirmButton: false, timer: 3000 });
      router.replace('/profile');
    }, 0);
  } else {
    const routePrefix = Object.keys(routePermissions).find(route => pathname === route || pathname.startsWith(route + '/'));
    if (routePrefix) {
      const { resource, action } = routePermissions[routePrefix];
      if (!hasPermission(resource, action)) {
        isAuthorized = false;
        setTimeout(() => {
          Swal.fire({ toast: true, position: 'top-end', text: `You don't have permission to access the ${resource} area.`, icon: 'error', showConfirmButton: false, timer: 3000 });
          router.replace('/');
        }, 0);
      }
    }
  }

  if (!isAuthorized) {
    return null; // Don't render the layout or children while redirecting
  }

  return (
    <DashboardContext.Provider
      value={{
        detections,
        setDetections,
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

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </AuthProvider>
  );
}
