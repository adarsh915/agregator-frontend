"use client";

import { useAuth } from "@/lib/authContext";
import React from "react";

interface RequirePermissionProps {
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  skeleton?: React.ReactNode;
  mode?: "hide" | "disable";
}

export default function RequirePermission({ 
  resource, 
  action, 
  children, 
  fallback = null,
  skeleton = null,
  mode = "disable"
}: RequirePermissionProps) {
  const { hasPermission, status } = useAuth();
  const loading = status === "loading";

  const permitted = hasPermission(resource, action);

  // If the cache (localStorage) already says we have permission, show it immediately!
  // This prevents UI flicker/delay while the backend verifies permissions.
  if (permitted) {
    return <>{children}</>;
  }

  // If we don't have permission yet (either because cache is empty or we actually don't have it)
  // and we are still loading, fallback to the loading state.
  if (loading) {
    if (skeleton) return <>{skeleton}</>;
    if (mode === "hide") return null;
    return renderDisabled(children);
  }

  // Finished loading, and still no permission.
  if (mode === "hide") {
    return <>{fallback}</>;
  }

  // mode === "disable"
  return renderDisabled(children);
}

// Helper to disable child elements if they are valid React elements
function renderDisabled(children: React.ReactNode) {
  return React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      // If it's a standard HTML element or component that accepts `disabled` and `style`
      const childElement = child as React.ReactElement<any>;
      return React.cloneElement(childElement, {
        disabled: true,
        style: {
          ...(childElement.props.style || {}),
          opacity: 0.5,
          cursor: "not-allowed",
          pointerEvents: "none"
        },
        title: "You do not have permission to perform this action"
      });
    }
    return child;
  });
}
