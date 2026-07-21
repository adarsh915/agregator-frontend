import React from "react";

export default function PageSkeleton({ layout = 'dashboard' }: { layout?: 'dashboard' | 'page' }) {
  if (layout === 'page') {
    return (
      <div style={{ opacity: 0.7, pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="panel-card" style={{ padding: '24px', animation: "pulse 1.5s infinite", minHeight: '400px' }}>
          <div style={{ width: '30%', height: '24px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '32px' }} />
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              <div style={{ width: '15%', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
              <div style={{ width: '100%', height: '42px', backgroundColor: '#e2e8f0', borderRadius: '6px' }} />
            </div>
          ))}
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ opacity: 0.7, pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Stats Row Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="panel-card" style={{ padding: '24px', animation: "pulse 1.5s infinite", animationDelay: `${i * 0.1}s` }}>
            <div style={{ width: '40%', height: '14px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '16px' }} />
            <div style={{ width: '60%', height: '32px', backgroundColor: '#e2e8f0', borderRadius: '6px', marginBottom: '12px' }} />
            <div style={{ width: '80%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
      
      {/* Main Content Area Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <div className="panel-card" style={{ padding: '24px', animation: "pulse 1.5s infinite", minHeight: '300px' }}>
          <div style={{ width: '30%', height: '24px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '24px' }} />
          <div style={{ width: '100%', height: '1px', backgroundColor: '#e2e8f0', marginBottom: '24px' }} />
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '20%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
              <div style={{ width: '100%', height: '40px', backgroundColor: '#e2e8f0', borderRadius: '6px' }} />
            </div>
          ))}
        </div>
        <div className="panel-card" style={{ padding: '24px', animation: "pulse 1.5s infinite", minHeight: '300px', animationDelay: '0.2s' }}>
          <div style={{ width: '30%', height: '24px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '24px' }} />
          <div style={{ width: '100%', height: '1px', backgroundColor: '#e2e8f0', marginBottom: '24px' }} />
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '20%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
              <div style={{ width: '100%', height: '40px', backgroundColor: '#e2e8f0', borderRadius: '6px' }} />
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
