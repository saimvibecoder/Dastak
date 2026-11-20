import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { after } from "next/server";
import type { Metadata } from "next";
import { getPublicRestaurant } from "@/lib/public";
import { supabaseService } from "@/lib/supabase/admin";
import { ipHash } from "@/lib/guard";
import ClaimForm from "./ClaimForm";
import { offerHeadline } from "@/lib/offer";

type P = { params: Promise<{ slug: string; table: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params; const r = await getPublicRestaurant(slug);
  const title = r ? (r.card_style === "premium" ? `${r.name}: guest list` : `${r.name}: welcome offer`) : "Offer";
  return { title, robots: { index: false } };
}
export default async function TablePage({ params }: P) {
  const { slug, table } = await params;
  const r = await getPublicRestaurant(slug);
  if (!r) notFound();
  const t = Number(table);
  const tableNo = Number.isInteger(t) && t >= 1 && t <= r.tables ? t : null;
  // Count the scan after the page is sent, so the guest never waits for it.
  const h = await headers();
  const ip = ipHash({ headers: h });
  const isBot = /bot|crawl|spider|preview|facebookexternalhit|whatsapp/i.test(h.get("user-agent") || "");
  if (!isBot) after(async () => { try { await supabaseService().rpc("log_scan", { p_slug: slug, p_table: tableNo, p_ip: ip }); } catch {} });
  return (
    <div className="gwrap" data-pal={r.palette}>
      <main id="main" className="guest" style={{ paddingTop: 32 }}>
        <ClaimForm slug={slug} table={tableNo} r={{ name: r.name, area: r.area, offer: r.offer, offerType: r.offer_type, whatsapp: r.whatsapp, premium: r.card_style === "premium" }} />
        <p className="c5" style={{ textAlign: "center", marginTop: 16 }}>By joining you agree to hear from {r.name} on WhatsApp. <a href={`/r/${slug}/stop`}>Leave the list</a> any time. Powered by Dastak · <a href="/privacy">Privacy</a></p>
      </main>
    </div>
  );
}
