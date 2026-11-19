import QRCode from "qrcode";
import { requireRestaurant } from "@/lib/data";
import { origin } from "@/lib/host";
import PrintButton from "./PrintButton";

export const metadata = { title: "Table QRs" };
export default async function QR({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const { r } = await requireRestaurant(slug); const site = await origin();
  const cards = await Promise.all(Array.from({ length: r.tables }, async (_, i) => {
    const url = `${site}/r/${slug}/t/${i + 1}`;
    return { n: i + 1, url, svg: await QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#111111", light: "#ffffff" } }) };
  }));
  return (<div className="card"><div className="row noprint"><span className="t3">Table cards · {r.tables} tables</span><span className="sp"></span><PrintButton /></div>
    <p className="c5 noprint" style={{ marginTop: 8 }}>Each code opens {site.replace(/^https?:\/\//, "")}/r/{slug}/t/table number. Change the number of tables in Settings.</p>
    <div className="qrc" style={{ marginTop: 16 }}>{cards.map((c) => (
      <div className="card qrcard" key={c.n}><div className="c5">{r.name}</div><div className="t3 b6">Scan for a {r.offer}</div>
        <div className="qrbox" dangerouslySetInnerHTML={{ __html: c.svg }} aria-label={`QR code for table ${c.n}`} role="img" />
        <div className="row" style={{ justifyContent: "center" }}><span className="chip">Table {c.n}</span><a className="c5 noprint" href={c.url} target="_blank" rel="noopener">Test</a></div></div>))}</div>
  </div>);
}
