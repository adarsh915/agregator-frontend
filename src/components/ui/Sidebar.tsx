"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { SIDEBAR_CONFIG, SidebarItem } from "./SidebarConfig";
import { useDashboard } from "@/app/(dashboard)/layout";

const SidebarSkeleton = () => {
  return (
    <nav className="side-nav">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="nav-item" style={{ pointerEvents: 'none' }}>
          <span className="nav-icon">
            <div style={{ width: 18, height: 18, backgroundColor: "#e2e8f0", borderRadius: 4 }} className="animate-pulse" />
          </span>
          <span className="nav-label">
            <div style={{ width: 90, height: 14, backgroundColor: "#e2e8f0", borderRadius: 4 }} className="animate-pulse" />
          </span>
        </div>
      ))}
    </nav>
  );
};

export default function Sidebar({ handleLogout }: { handleLogout: () => void }) {
  const pathname = usePathname();
  const { status, hasPermission } = useAuth();
  
  const {
    setMobileSidebarOpen,
    sidebarSettingsOpen,
    setSidebarSettingsOpen,
    setSettingsTab,
  } = useDashboard();

  if (status === "loading") {
    return <SidebarSkeleton />;
  }

  const renderItem = (item: SidebarItem) => {
    // Check permission for parent
    if (item.requiredResource && item.requiredAction) {
      if (!hasPermission(item.requiredResource, item.requiredAction)) {
        return null;
      }
    }

    // Handle nested children (like Settings)
    if (item.children) {
      const activeChildren = item.children.filter(child => {
        if (child.requiredResource && child.requiredAction) {
          return hasPermission(child.requiredResource, child.requiredAction);
        }
        return true;
      });

      if (activeChildren.length === 0) return null;

      const isSettingsActive = pathname === "/settings" || pathname === "/packages" || pathname === "/billing-records";

      return (
        <div key={item.key} style={{ display: "grid", gap: 4, width: "100%" }}>
          <button
            onClick={() => setSidebarSettingsOpen(!sidebarSettingsOpen)}
            className={`nav-item ${isSettingsActive ? "active" : ""}`}
            style={{ width: "100%", justifyContent: "space-between", display: "flex", alignItems: "center", border: "none", background: "transparent", font: "inherit" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </div>
            <span style={{ fontSize: "0.65rem", color: "var(--muted)", transition: "transform var(--transition-fast)", transform: sidebarSettingsOpen ? "rotate(180deg)" : "rotate(0deg)" }}>&#9660;</span>
          </button>
          
          {sidebarSettingsOpen && (
            <div style={{ paddingLeft: 32, display: "grid", gap: 4 }}>
              {activeChildren.map(child => (
                <Link
                  key={child.key}
                  href={child.route}
                  onClick={() => {
                    setMobileSidebarOpen(false);
                    if (child.key === "roles") setSettingsTab("roles");
                  }}
                  className={`nav-item ${pathname === child.route ? "active" : ""}`}
                  style={{
                    padding: "8px 12px",
                    fontSize: "0.85rem",
                    justifyContent: "flex-start"
                  }}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Standard item
    return (
      <Link
        key={item.key}
        href={item.route}
        onClick={() => setMobileSidebarOpen(false)}
        className={`nav-item ${pathname === item.route ? "active" : ""}`}
      >
        <span className="nav-icon">{item.icon}</span>
        <span className="nav-label">{item.label}</span>
      </Link>
    );
  };

  return (
    <nav className="side-nav">
      {SIDEBAR_CONFIG.map(renderItem)}
      
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
  );
}
