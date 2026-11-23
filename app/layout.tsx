import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/inter";
import { cookies } from "next/headers";
import { isPalette } from "@/lib/palettes";
import PaletteSwitcher from "@/components/PaletteSwitcher";
import "./globals.css";


const SITE = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_ENV === "production" ? "https://dastak.food" : "http://localhost:3000");
const TITLE = "Dastak: WhatsApp guest list for restaurants in Lucknow";
const DESC = "Turn every table into a WhatsApp guest list. Diners scan a QR, claim a welcome offer and join your list, so you can fill your slow hours. Now in Lucknow.";

export const metadata: Metadata = {
  title: { default: TITLE, template: "%s · Dastak" },
  description: DESC,
  metadataBase: new URL(SITE),
  openGraph: { type: "website", siteName: "Dastak", locale: "en_IN", title: TITLE, description: "Turn every diner into a regular on WhatsApp." },
  twitter: { card: "summary_large_image", title: TITLE, description: "Turn every diner into a regular on WhatsApp." },
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Dastak", statusBarStyle: "default" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ece4d9" };

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
