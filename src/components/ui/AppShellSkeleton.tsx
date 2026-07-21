import React from "react";

export default function AppShellSkeleton() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Sidebar Skeleton */}
      <aside style={{ width: 260, backgroundColor: 'white', borderRight: '1px solid #e2e8f0', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ width: 140, height: 32, backgroundColor: '#e2e8f0', borderRadius: 6, marginLeft: 12 }} className="animate-pulse" />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 7 }).map((_, i) => (
             <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 12px' }}>
                <div style={{ width: 20, height: 20, backgroundColor: '#e2e8f0', borderRadius: 4 }} className="animate-pulse" />
                <div style={{ width: 120, height: 16, backgroundColor: '#e2e8f0', borderRadius: 4 }} className="animate-pulse" />
             </div>
          ))}
        </div>
      </aside>

      {/* Main Content Area Skeleton */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header Skeleton */}
        <header style={{ height: 64, backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px', gap: 16 }}>
           <div style={{ width: 32, height: 32, backgroundColor: '#e2e8f0', borderRadius: '50%' }} className="animate-pulse" />
           <div style={{ width: 120, height: 32, backgroundColor: '#e2e8f0', borderRadius: 6 }} className="animate-pulse" />
        </header>

        {/* Page Content Skeleton */}
        <main style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
           <div style={{ width: 200, height: 32, backgroundColor: '#e2e8f0', borderRadius: 6 }} className="animate-pulse" />
           <div style={{ width: '100%', minHeight: 400, flex: 1, backgroundColor: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }} className="animate-pulse" />
        </main>
      </div>
    </div>
  );
}

export function PageContentSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>
      <div style={{ width: 200, height: 32, backgroundColor: '#e2e8f0', borderRadius: 6 }} className="animate-pulse" />
      <div style={{ width: '100%', minHeight: 400, backgroundColor: 'white', borderRadius: 12, border: '1px solid #e2e8f0' }} className="animate-pulse" />
    </div>
  );
}
