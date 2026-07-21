import React from "react";

export default function TableSkeleton() {
  return (
    <div className="table-container" style={{ opacity: 0.7, pointerEvents: 'none' }}>
      <table className="data-table">
        <thead>
          <tr>
            {[...Array(5)].map((_, i) => (
              <th key={i}>
                <div style={{
                  height: "20px",
                  backgroundColor: "#e2e8f0",
                  borderRadius: "4px",
                  animation: "pulse 1.5s infinite"
                }}></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i}>
              {[...Array(5)].map((_, j) => (
                <td key={j}>
                  <div style={{
                    height: j === 0 ? "36px" : "16px",
                    width: j === 0 ? "36px" : "80%",
                    borderRadius: j === 0 ? "50%" : "4px",
                    backgroundColor: "#e2e8f0",
                    animation: "pulse 1.5s infinite",
                    animationDelay: `${i * 0.1}s`
                  }}></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
