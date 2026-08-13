import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        { key: "Content-Security-Policy", value: "default-src 'self'; base-uri 'self'; form-action 'self' https://accounts.google.com; frame-ancestors 'self'; frame-src https://accounts.google.com; img-src 'self' data: blob: https://*.googleusercontent.com https://*.gstatic.com; style-src 'self' 'unsafe-inline' https://accounts.google.com; script-src 'self' 'unsafe-inline' https://accounts.google.com; connect-src 'self' https://api.open-meteo.com https://accounts.google.com" },
      ],
    }];
  },
};

export default nextConfig;
