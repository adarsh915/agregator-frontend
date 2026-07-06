"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/app/(dashboard)/layout";
import Swal from "sweetalert2";

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
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear authentication data
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
          // Redirect to login page
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

          <nav className="side-nav">
            <Link
              href="/"
              onClick={() => setMobileSidebarOpen(false)}
              className={`nav-item ${pathname === "/" ? "active" : ""}`}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
              </span>
              <span className="nav-label">Overview</span>
            </Link>

            <Link
              href="/enterprises"
              onClick={() => setMobileSidebarOpen(false)}
              className={`nav-item ${pathname === "/enterprises" ? "active" : ""}`}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <span className="nav-label">Enterprises</span>
            </Link>



            <Link
              href="/detections"
              onClick={() => setMobileSidebarOpen(false)}
              className={`nav-item ${pathname === "/detections" ? "active" : ""}`}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </span>
              <span className="nav-label">Detections</span>
            </Link>

            <Link
              href="/users"
              onClick={() => setMobileSidebarOpen(false)}
              className={`nav-item ${pathname === "/users" ? "active" : ""}`}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </span>
              <span className="nav-label">Users</span>
            </Link>

            <Link
              href="/profile"
              onClick={() => setMobileSidebarOpen(false)}
              className={`nav-item ${pathname === "/profile" ? "active" : ""}`}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <span className="nav-label">My Profile</span>
            </Link>

            {(profileRole === 'Super Admin' || profileRole === 'super_admin') && (
              <Link
                href="/audit-logs"
                onClick={() => setMobileSidebarOpen(false)}
                className={`nav-item ${pathname === "/audit-logs" ? "active" : ""}`}
              >
                <span className="nav-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </span>
                <span className="nav-label">Audit Logs</span>
              </Link>
            )}

            <div style={{ display: "grid", gap: 4, width: "100%" }}>
              <button
                onClick={() => {
                  setSidebarSettingsOpen(!sidebarSettingsOpen);
                }}
                className={`nav-item ${pathname === "/settings" || pathname === "/packages" ? "active" : ""}`}
                style={{ width: "100%", justifyContent: "space-between", display: "flex", alignItems: "center", border: "none", background: "transparent", font: "inherit" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span className="nav-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                  </span>
                  <span className="nav-label">Settings</span>
                </div>
                <span style={{ fontSize: "0.65rem", color: "var(--muted)", transition: "transform var(--transition-fast)", transform: sidebarSettingsOpen ? "rotate(180deg)" : "rotate(0deg)" }}>&#9660;</span>
              </button>
              {sidebarSettingsOpen && (
                <div style={{ paddingLeft: 32, display: "grid", gap: 4 }}>
                  <Link
                    href="/settings"
                    onClick={() => {
                      setMobileSidebarOpen(false);
                      setSettingsTab("roles");
                    }}
                    className="nav-item"
                    style={{
                      padding: "8px 12px",
                      fontSize: "0.85rem",
                      justifyContent: "flex-start"
                    }}
                  >
                    Role Management
                  </Link>
                  <Link
                    href="/packages"
                    onClick={() => {
                      setMobileSidebarOpen(false);
                    }}
                    className="nav-item"
                    style={{
                      padding: "8px 12px",
                      fontSize: "0.85rem",
                      justifyContent: "flex-start"
                    }}
                  >
                    Package Management
                  </Link>
                  <Link
                    href="/billing-records"
                    onClick={() => {
                      setMobileSidebarOpen(false);
                    }}
                    className="nav-item"
                    style={{
                      padding: "8px 12px",
                      fontSize: "0.85rem",
                      justifyContent: "flex-start"
                    }}
                  >
                    Billing Records
                  </Link>
                </div>
              )}
            </div>

            <button
              type="button"
              className="nav-item nav-item-logout"
              onClick={handleLogout}
              style={{ border: "none", background: "transparent" }}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </span>
              <span className="nav-label">Logout</span>
            </button>
          </nav>
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
