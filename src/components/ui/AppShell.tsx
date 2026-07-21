"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/app/(dashboard)/layout";
import Swal from "sweetalert2";
import RequirePermission from "@/components/auth/RequirePermission";
import Sidebar from "@/components/ui/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
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
    setSettingsTab,
    profileName,
    profileRole,
  } = useDashboard();

  // Get initials for profile avatar
  const initials = profileName
    ? profileName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "AS";

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "All notifications marked as read.",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout Requested",
      text: "Are you sure you want to end your administration session?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Logout",
      cancelButtonText: "Stay logged in",
      confirmButtonColor: "#ef4444",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // M-3 fix: invalidate the server-side session first so the token
        // cannot be replayed even if extracted from memory or logs.
        try {
          const token = localStorage.getItem('authToken');
          if (token) {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/api/v1/auth/logout`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        } catch {
          // Swallow — even if the backend call fails, clear local state
        }

        // Clear local authentication data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Show success message
        Swal.fire({
          title: "Session Terminated",
          text: "You have logged out successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          window.location.href = '/login';
        });
      }
    });
  };

  return (
    <div className={`app-shell ${desktopSidebarOpen ? "" : "sidebar-collapsed"} ${mobileSidebarOpen ? "mobile-sidebar-open" : ""}`}>
      
      {/* ==========================================
          LEFT COLLAPSIBLE SIDEBAR
         ========================================== */}
      <aside className={`sidebar ${mobileSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-inner">
          <div className="brand-block">
            <div>
              <p className="eyebrow">Aggregator Control</p>
              <h1>Shield Master</h1>
            </div>
            <button
              type="button"
              className="sidebar-close-btn"
              aria-label="Close navigation"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <span />
              <span />
            </button>
          </div>

          <Sidebar handleLogout={handleLogout} />
        </div>
      </aside>

      <div
        className={`sidebar-backdrop ${mobileSidebarOpen ? "show" : ""}`}
        onClick={() => setMobileSidebarOpen(false)}
        role="button"
        aria-label="Close navigation"
        tabIndex={0}
      />

      {/* ==========================================
          MAIN PANEL & HEADER
         ========================================== */}
      <main className="main-panel">
        {/* Unified Responsive Header Bar */}
        <div className="mobile-topbar">
          <button
            type="button"
            className="sidebar-open-btn"
            aria-label="Open navigation"
            onClick={() => {
              setDesktopSidebarOpen(!desktopSidebarOpen);
            }}
          >
            <span />
            <span />
            <span />
          </button>

          <button
            type="button"
            className="mobile-menu-btn"
            aria-label="Open navigation"
            onClick={() => {
              setMobileSidebarOpen(true);
            }}
          >
            <span />
            <span />
            <span />
          </button>

          <div className="mobile-brand topbar-page-title">
            <p className="eyebrow" style={{ color: "#3b82f6" }}>Aggregator Console</p>
            <strong>
              {pathname === "/" && "Dashboard Overview"}
              {pathname === "/enterprises" && "Enterprise Organizations"}
              {pathname === "/detections" && "Detection Analytics Center"}
              {pathname === "/users" && "Internal Staff Management"}
              {pathname === "/profile" && "My Account Profile"}
              {pathname === "/settings" && "Aggregator Settings"}
              {pathname === "/roles" && "Role Management"}
              {pathname === "/packages" && "Package Management"}
              {pathname === "/billing-records" && "Billing Records"}
              {pathname === "/audit-logs" && "Audit Logs"}
            </strong>
          </div>

          <label className="topbar-module-search" aria-label="Search modules">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input type="search" placeholder="Search module..." />
          </label>

          <div className="topbar-action-group">
            {/* Notifications Panel Dropdown */}
            <div className="notifications-menu" style={{ position: "relative" }}>
              <button
                type="button"
                className="tool-icon"
                aria-label="Show notifications"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                }}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 18, height: 18 }}
                >
                  <path d="M10.27 21a2 2 0 0 0 3.46 0" />
                  <path d="M4 17h16" />
                  <path d="M18 17v-5a6 6 0 0 0-12 0v5" />
                </svg>
                {unreadCount > 0 ? (
                  <span style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    background: "var(--danger)",
                    color: "#fff",
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                    borderRadius: "999px",
                    minWidth: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #fff",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                    padding: "0 4px"
                  }}>
                    {unreadCount}
                  </span>
                ) : null}
              </button>

              {notificationsOpen && (
                <div
                  className="panel-card notifications-panel"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    zIndex: 9999,
                    width: 320,
                    boxShadow: "var(--shadow-md)",
                    padding: 16,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: "1px solid var(--border-light)", paddingBottom: 8 }}>
                    <strong>System Alerts</strong>
                    <div style={{ display: "flex", gap: 8 }}>
                      <small style={{ color: "#3b82f6", cursor: "pointer" }} onClick={markAllNotificationsAsRead}>
                        Mark all read
                      </small>
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: 8, maxHeight: 240, overflowY: "auto" }}>
                    {notifications.map((item) => (
                      <article
                        key={item.id}
                        style={{
                          padding: 8,
                          borderRadius: 8,
                          background: item.read ? "transparent" : "var(--accent-soft)",
                          borderLeft: `3px solid var(--${item.tone === "danger" ? "danger" : item.tone === "warn" ? "warning" : item.tone === "safe" ? "success" : "info"})`,
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: "0.85rem", display: "block" }}>{item.title}</strong>
                          <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)" }}>{item.detail}</p>
                        </div>
                        <small style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{item.time}</small>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu Trigger */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                className="profile-chip"
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                }}
              >
                <div className="profile-avatar">
                  {initials}
                </div>
                <div className="profile-meta">
                  <strong>{profileName}</strong>
                  <small>{profileRole}</small>
                </div>
              </button>

              {profileDropdownOpen && (
                <div
                  className="panel-card"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    zIndex: 9999,
                    width: 180,
                    padding: 8,
                    boxShadow: "var(--shadow-md)",
                    display: "grid",
                    gap: 4
                  }}
                >
                  <Link
                    href="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="nav-item"
                    style={{ padding: "8px 12px", fontSize: "0.85rem" }}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => {
                      setSettingsTab("roles");
                      setProfileDropdownOpen(false);
                    }}
                    className="nav-item"
                    style={{ padding: "8px 12px", fontSize: "0.85rem" }}
                  >
                    System Settings
                  </Link>
                  <div style={{ height: 1, backgroundColor: "#e2e8f0", margin: "4px 0" }} />
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      borderRadius: 6,
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="page-stack">
          {children}
        </div>
      </main>
    </div>
  );
}
