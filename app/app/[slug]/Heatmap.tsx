"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { DAYS, hourLabel } from "@/lib/util";

const HOURS = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
export default function Heatmap({ slug, cells }: { slug: string; cells: { dow: number; hr: number; n: number }[] }) {
  const m = useMemo(() => { const g = DAYS.map(() => HOURS.map(() => 0)); cells.forEach((c) => { const h = HOURS.indexOf(c.hr); if (h >= 0 && c.dow >= 0 && c.dow < 7) g[c.dow][h] = c.n; }); return g; }, [cells]);
  const max = Math.max(1, ...m.flat());
  const slow = useMemo(() => { let b: { d: number; h: number; n: number } | null = null; m.forEach((r, d) => r.forEach((n, h) => { if (HOURS[h] > 21) return; if (!b || n < b.n) b = { d, h, n }; })); return b as { d: number; h: number; n: number } | null; }, [m]);
  const [sel, setSel] = useState<{ d: number; h: number } | null>(null);
  const cur = sel ?? slow;
  const slotText = cur ? `${DAYS[cur.d]} ${hourLabel(HOURS[cur.h])} to ${hourLabel(HOURS[cur.h] + 2)}` : "";
  return (
    <div className="card"><div className="row"><span className="t3">When guests visit</span><span className="sp"></span><span className="c5">Tap a slot to target it</span></div>
      <div className="heatwrap" style={{ marginTop: 16 }}><div className="heat">
        <div className="lab"></div>{HOURS.map((h) => <div key={h} className="lab hl" style={{ justifyContent: "center" }}>{h % 12 || 12}</div>)}
        {m.map((row, d) => [<div key={`l${d}`} className="lab">{DAYS[d].slice(0, 3)}</div>, ...row.map((n, h) => (
          <div key={`${d}-${h}`} role="button" tabIndex={0} className={`cell ${cur && cur.d === d && cur.h === h ? "sel" : ""}`} title={`${DAYS[d]} ${hourLabel(HOURS[h])}: ${n} visits`}
            aria-label={`${DAYS[d]} ${hourLabel(HOURS[h])}, ${n} visits`} onClick={() => setSel({ d, h })} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel({ d, h }); } }}
            style={{ background: `color-mix(in srgb,var(--accent) ${Math.round(8 + (86 * n) / max)}%,var(--bg))` }} />))])}
      </div></div>
      {cur && <div className="row" style={{ marginTop: 16 }}><div><div className="c5">{sel ? `Selected slot · ${m[cur.d][cur.h]} visits` : "Slowest slot"}</div><div className="t3">{DAYS[cur.d]}, {hourLabel(HOURS[cur.h])}</div></div>
        <span className="sp"></span><Link className="btn pri sm" href={`/app/${slug}/send?slot=${encodeURIComponent(slotText)}`}>Fill this slot</Link></div>}
    </div>);
}
