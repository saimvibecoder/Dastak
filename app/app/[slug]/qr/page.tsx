import Link from "next/link";
import QRCode from "qrcode";
import { requireRestaurant } from "@/lib/data";
import { origin } from "@/lib/host";
import PrintButton from "./PrintButton";
import { asOfferType, offerHeadline, offerLine } from "@/lib/offer";

export const metadata = { title: "Table cards" };
export default async function QR({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ style?: string }> }) {
  const { slug } = await params; const { style } = await searchParams;
  const { r } = await requireRestaurant(slug); const site = await origin();
  const premium = (style ?? r.card_style) === "premium";
  const cards = await Promise.all(Array.from({ length: r.tables }, async (_, i) => {
    const url = `${site}/r/${slug}/t/${i + 1}`;
    return { n: i + 1, url, svg: await QRCode.toString(url, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#1c120c", light: "#ffffff" } }) };
  }));
  return (<div className="card">
    <div className="row noprint"><span className="t3">Table cards · {r.tables} tables</span><span className="sp"></span>
      <div className="row" style={{ gap: 8 }} role="group" aria-label="Card design">
        <Link className={`btn ghost sm ${!premium ? "on" : ""}`} aria-pressed={!premium} href={`/app/${slug}/qr?style=free`}>Welcome offer card</Link>
        <Link className={`btn ghost sm ${premium ? "on" : ""}`} aria-pressed={premium} href={`/app/${slug}/qr?style=premium`}>Premium card</Link>
      </div><PrintButton /></div>
    <p className="c5 noprint" style={{ marginTop: 8 }}>{premium
      ? "Premium card: no offer in the headline. Guests join the guest list for private offers; set the guest page to match in Settings."
      : `Welcome offer card: guests scan for ${offerLine(asOfferType(r.offer_type), r.offer)}.`} Prints two cards per A4 page. Each code opens {site}/r/{slug}/t/table number.</p>
    <div className="tcards" style={{ marginTop: 16 }}>{cards.map((c) => (
      <div className={`tcard ${premium ? "prem" : ""}`} key={c.n}>
        <div className="tc-eyebrow">{r.name}</div>
        <div className="tc-h">{premium ? <>Join our<br /><em>guest list</em></> : <><span className="tc-kicker">Your welcome offer</span>{offerHeadline(asOfferType(r.offer_type), r.offer)}</>}</div>
        <div className="tc-sub">{premium ? "Private offers and first tastings, on WhatsApp" : "Join our guest list to claim it with this meal"}</div>
        <div className="tc-qr" dangerouslySetInnerHTML={{ __html: c.svg }} aria-label={`QR code for table ${c.n}`} role="img" />
        <div className="tc-hint">Point your phone camera here</div>
        <div className="tc-foot"><span>Table {c.n}</span><span>Powered by Dastak</span></div>
        <a className="c5 noprint tc-test" href={c.url} target="_blank" rel="noopener">Test this card</a>
      </div>))}</div>
  </div>);
}
