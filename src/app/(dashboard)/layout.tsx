"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

  useEffect(() => {
    // Load actual user details on mount
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.displayName) setProfileName(user.displayName);
        if (user.email) setProfileEmail(user.email);
        if (user.role) setProfileRole(user.role);
      } catch (err) {
        console.error("Failed to load user profile from storage", err);
      }
    }
  }, []);

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
