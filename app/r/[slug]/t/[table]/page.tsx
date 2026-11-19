import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicRestaurant } from "@/lib/public";
import ClaimForm from "./ClaimForm";

type P = { params: Promise<{ slug: string; table: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params; const r = await getPublicRestaurant(slug);
  return { title: r ? `${r.name}: ${r.offer}` : "Offer", robots: { index: false } };
}
export default async function TablePage({ params }: P) {
  const { slug, table } = await params;
  const r = await getPublicRestaurant(slug);
  if (!r) notFound();
  const t = Number(table);
  const tableNo = Number.isInteger(t) && t >= 1 && t <= r.tables ? t : null;
  return (
    <div className="gwrap" data-pal={r.palette}>
      <main id="main" className="guest" style={{ paddingTop: 32 }}>
        <ClaimForm slug={slug} table={tableNo} r={{ name: r.name, area: r.area, offer: r.offer, whatsapp: r.whatsapp }} />
        <p className="c5" style={{ textAlign: "center", marginTop: 16 }}>By joining you agree to hear from {r.name} on WhatsApp. <a href={`/r/${slug}/stop`}>Leave the list</a> any time. Powered by Dastak · <a href="/privacy">Privacy</a></p>
      </main>
    </div>
  );
}
