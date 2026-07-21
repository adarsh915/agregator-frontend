import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // M-5: Prevent clickjacking
          { key: "X-Frame-Options",        value: "DENY" },
          // M-5: Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // M-5: Limit referrer information
          { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
          // M-5: Restrict browser features
          { key: "Permissions-Policy",     value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

