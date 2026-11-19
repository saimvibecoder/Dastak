import type { NextConfig } from "next";
const security = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];
const config: NextConfig = { async headers() { return [{ source: "/(.*)", headers: security }]; } };
export default config;
