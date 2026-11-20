import Link from "next/link";
import Bars, { BarLabels } from "@/components/Bars";
import Heatmap from "./Heatmap";
import { requireRestaurant } from "@/lib/data";
import { fmtDate, initials, DAYS } from "@/lib/util";
import { parseSlots, todayIST, partOf, slotText } from "@/lib/slots";

export const metadata = { title: "Overview" };
type Stats = { total: number; all: number; week: number; prev_week: number; redeemed: number; repeat: number };

export default async function Overview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { sb, r, role } = await requireRestaurant(slug);
  const [{ data: st }, { data: days }, { data: heat }, { data: latest }, { data: fn }] = await Promise.all([
    sb.rpc("guest_stats", { rid: r.id }),
    sb.rpc("guests_per_day", { rid: r.id, days: 14 }),
    sb.rpc("visit_heatmap", { rid: r.id }),
    sb.from("guests").select("id,name,table_no,created_at,redeemed_at,code").eq("restaurant_id", r.id).order("created_at", { ascending: false }).limit(5),
    sb.rpc("funnel", { rid: r.id }),
  ]);
  const { data: od } = await sb.from("offer_drafts").select("id,name,created_at").eq("restaurant_id", r.id).is("used_at", null).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const ready = od ? (<div className="card nudge"><div className="sp"><div className="t3">Your offer for this week is ready: {od.name}</div>
      <div className="c2">Written for you by Dastak. Check it and send it to your guests in a few taps.</div></div>
      <Link className="btn pri sm" href={`/app/${slug}/send?draft=${od.id}`}>Review and send</Link></div>) : null;
  const f = (fn ?? { scans: 0, signups: 0, redeemed: 0, sent: 0, returned: 0 }) as Record<"scans" | "signups" | "redeemed" | "sent" | "returned", number>;
  const steps: [string, number, string][] = [
    ["Scans", f.scans, "table card scans"], ["Sign-ups", f.signups, "joined the list"], ["Dishes redeemed", f.redeemed, "codes used at the table"],
    ["Offers sent", f.sent, "WhatsApp messages"], ["Came back", f.returned, "guests back after an offer"]];
  const rate = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "–");
  const funnel = (<div className="card" style={{ marginTop: 16 }}><div className="row"><span className="t3">How Dastak is working</span><span className="sp"></span><span className="c5">All time</span></div>
    <div className="funnel" style={{ marginTop: 16 }}>{steps.map(([l, n, d], i) => (
      <div className="fstep" key={l}><div className="c5">{l}</div><div className="n mono">{n.toLocaleString("en-IN")}</div><div className="c5">{d}</div>
        {i > 0 && i !== 3 && <div className="frate mono" title={`${l} as a share of ${steps[i - 1][0].toLowerCase()}`}>{rate(n, i === 4 ? f.signups : steps[i - 1][1])} {i === 4 ? "of sign-ups" : `of ${steps[i - 1][0].toLowerCase()}`}</div>}</div>))}</div></div>);
  // Slow-hour reminder for today
  const slots = parseSlots(r.slow_slots); const today = todayIST(); const todays = slots.filter((x) => x.d === today);
  const tplFor = (p: string) => (p === "evening" || p === "late" ? 1 : 0);
  const nudge = todays.length ? (<div className="card nudge"><div className="sp"><div className="t3">{DAYS[today]} {todays.map((x) => partOf(x.p).label.toLowerCase()).join(" and ")} {todays.length > 1 ? "are" : "is"} usually slow</div>
      <div className="c2">Send your guests an offer now to fill the tables.</div></div>
      <Link className="btn pri sm" href={`/app/${slug}/send?slot=${encodeURIComponent(slotText(todays[0]))}&tpl=${tplFor(todays[0].p)}`}>Send an offer</Link></div>)
    : !slots.length && role === "owner" ? (<div className="card nudge"><div className="sp"><div className="t3">When is your dining room quiet?</div><div className="c2">Set your slow hours and Dastak will remind you on those days.</div></div>
      <Link className="btn ghost sm" href={`/app/${slug}/settings#slow`}>Set slow hours</Link></div>) : null;
  const s: Stats = st ?? { total: 0, all: 0, week: 0, prev_week: 0, redeemed: 0, repeat: 0 };
  const pct = (a: number) => (s.all ? Math.round((a / s.all) * 100) + "%" : "0%");
  const diff = s.week - s.prev_week;
  const kpis = [["Guests on list", s.total.toLocaleString("en-IN"), "opted in"], ["New this week", String(s.week), `${diff >= 0 ? "+" : ""}${diff} vs last week`],
    ["Offers claimed", pct(s.redeemed), `${s.redeemed} codes used`], ["Came back", pct(s.repeat), `${s.repeat} repeat guests`]];
  const series = (days ?? []).map((d: { day: string; n: number }) => ({ label: fmtDate(d.day + "T12:00:00+05:30"), n: d.n }));

  if (!s.all) return (<>{ready}{nudge}
    <div className="card empty"><h2 style={{ fontSize: 30, lineHeight: "36px", color: "var(--fg)" }}>Your list starts at the <em>tables</em></h2>
      <p className="c2" style={{ margin: "12px auto 24px", maxWidth: 460 }}>Print the QR cards and put one on every table. The first guest who scans shows up here within seconds.</p>
      <Link className="btn pri" href={`/app/${slug}/qr`}>Get the table cards</Link></div>{funnel}</>);

  return (<>{ready}{nudge}
    <div className="grid g4">{kpis.map(([l, n, d]) => <div className="card kpi" style={{ padding: 16 }} key={l}><div className="c5">{l}</div><div className="n mono">{n}</div><div className="d">{d}</div></div>)}</div>
    <div className="grid g2" style={{ marginTop: 16 }}>
      <div className="card"><div className="row"><span className="t3">New guests per day</span><span className="sp"></span><span className="c5">Last 14 days</span></div>
        <div style={{ marginTop: 16 }}><Bars data={series} /><BarLabels data={series} /></div></div>
      <Heatmap slug={slug} cells={(heat ?? []) as { dow: number; hr: number; n: number }[]} />
    </div>
    {funnel}
    <div className="card" style={{ marginTop: 16 }}><div className="row"><span className="t3">Latest guests</span><span className="sp"></span><Link className="btn ghost sm" href={`/app/${slug}/guests`}>See all</Link></div>
      <div style={{ marginTop: 8 }}>{(latest ?? []).map((g) => (
        <div className="qitem" key={g.id}><span className="av">{initials(g.name)}</span><div className="sp"><div className="t3 b6">{g.name}</div><div className="c5">{g.table_no ? `Table ${g.table_no} · ` : ""}{fmtDate(g.created_at)}</div></div>
          {g.redeemed_at ? <span className="chip ok">Code used</span> : <span className="chip ac mono">{g.code}</span>}</div>))}</div></div>
  </>);
}
