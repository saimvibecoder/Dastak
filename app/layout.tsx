import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/inter";
import { cookies } from "next/headers";
import { isPalette } from "@/lib/palettes";
import PaletteSwitcher from "@/components/PaletteSwitcher";
import "./globals.css";


export const metadata: Metadata = {
  title: { default: "Dastak for restaurants", template: "%s · Dastak" },
  description: "Dastak turns every table into a WhatsApp guest list. Diners scan a QR for a free starter, join your list, and come back when you message them.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: { title: "Dastak for restaurants", description: "Turn every diner into a regular on WhatsApp." },
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const c = (await cookies()).get("pal")?.value;
  const pal = isPalette(c) ? c : "sand";
  return (
    <html lang="en" data-pal={pal}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        {children}
        <PaletteSwitcher current={pal} />
      </body>
    </html>
  );
}
