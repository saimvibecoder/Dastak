import Link from "next/link";
import Bars, { BarLabels } from "@/components/Bars";
import Heatmap from "./Heatmap";
import { requireRestaurant } from "@/lib/data";
import { fmtDate, initials } from "@/lib/util";

export const metadata = { title: "Overview" };
type Stats = { total: number; all: number; week: number; prev_week: number; redeemed: number; repeat: number };

export default async function Overview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { sb, r } = await requireRestaurant(slug);
  const [{ data: st }, { data: days }, { data: heat }, { data: latest }] = await Promise.all([
    sb.rpc("guest_stats", { rid: r.id }),
    sb.rpc("guests_per_day", { rid: r.id, days: 14 }),
    sb.rpc("visit_heatmap", { rid: r.id }),
    sb.from("guests").select("id,name,table_no,created_at,redeemed_at,code").eq("restaurant_id", r.id).order("created_at", { ascending: false }).limit(5),
  ]);
  const s: Stats = st ?? { total: 0, all: 0, week: 0, prev_week: 0, redeemed: 0, repeat: 0 };
  const pct = (a: number) => (s.all ? Math.round((a / s.all) * 100) + "%" : "0%");
  const diff = s.week - s.prev_week;
  const kpis = [["Guests on list", s.total.toLocaleString("en-IN"), "opted in"], ["New this week", String(s.week), `${diff >= 0 ? "+" : ""}${diff} vs last week`],
    ["Offers claimed", pct(s.redeemed), `${s.redeemed} codes used`], ["Came back", pct(s.repeat), `${s.repeat} repeat guests`]];
  const series = (days ?? []).map((d: { day: string; n: number }) => ({ label: fmtDate(d.day + "T12:00:00+05:30"), n: d.n }));

  if (!s.all) return (
    <div className="card empty"><h2 style={{ fontSize: 30, lineHeight: "36px", color: "var(--fg)" }}>Your list starts at the <em>tables</em></h2>
      <p className="c2" style={{ margin: "12px auto 24px", maxWidth: 460 }}>Print the QR cards and put one on every table. The first guest who scans shows up here within seconds.</p>
      <Link className="btn pri" href={`/app/${slug}/qr`}>Get the table cards</Link></div>);

  return (<>
    <div className="grid g4">{kpis.map(([l, n, d]) => <div className="card kpi" style={{ padding: 16 }} key={l}><div className="c5">{l}</div><div className="n mono">{n}</div><div className="d">{d}</div></div>)}</div>
    <div className="grid g2" style={{ marginTop: 16 }}>
      <div className="card"><div className="row"><span className="t3">New guests per day</span><span className="sp"></span><span className="c5">Last 14 days</span></div>
        <div style={{ marginTop: 16 }}><Bars data={series} /><BarLabels data={series} /></div></div>
      <Heatmap slug={slug} cells={(heat ?? []) as { dow: number; hr: number; n: number }[]} />
    </div>
    <div className="card" style={{ marginTop: 16 }}><div className="row"><span className="t3">Latest guests</span><span className="sp"></span><Link className="btn ghost sm" href={`/app/${slug}/guests`}>See all</Link></div>
      <div style={{ marginTop: 8 }}>{(latest ?? []).map((g) => (
        <div className="qitem" key={g.id}><span className="av">{initials(g.name)}</span><div className="sp"><div className="t3 b6">{g.name}</div><div className="c5">{g.table_no ? `Table ${g.table_no} · ` : ""}{fmtDate(g.created_at)}</div></div>
          {g.redeemed_at ? <span className="chip ok">Code used</span> : <span className="chip ac mono">{g.code}</span>}</div>))}</div></div>
  </>);
}
