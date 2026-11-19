import type { Metadata } from "next";
// Admin pages point at their own manifest, so installing from here gives a separate "Dastak Admin" app.
export const metadata: Metadata = {
  manifest: "/admin.webmanifest",
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon-admin.png" },
  appleWebApp: { capable: true, title: "Dastak Admin", statusBarStyle: "black" },
};
export default function AdminLayout({ children }: { children: React.ReactNode }) { return children; }
