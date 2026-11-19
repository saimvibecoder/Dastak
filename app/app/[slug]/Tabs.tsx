"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function Tabs({ slug, owner }: { slug: string; owner: boolean }) {
  const p = usePathname(); const base = `/app/${slug}`;
  const tabs = [["", "Overview"], ["/guests", "Guests"], ["/send", "Send offer"], ["/redeem", "Redeem code"], ["/qr", "Table QRs"], ...(owner ? [["/settings", "Settings"]] : [])];
  return (<nav className="tabs" aria-label="Dashboard">{tabs.map(([h, l]) => (
    <Link key={h} href={base + h} aria-current={p === base + h ? "page" : undefined}>{l}</Link>))}</nav>);
}
