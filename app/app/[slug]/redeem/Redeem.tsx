"use client";
import { useState, useTransition } from "react";
import { findCode, setRedeemed, logReturn } from "../actions";
import { fmtDate, firstName } from "@/lib/util";

type Guest = { id: string; name: string; table_no: number | null; created_at: string; redeemed_at: string | null; code: string };
type Found = { guest: Guest; campaign: { id: string; name: string; created_at: string } | null; lastReturn: string | null };
const sameDay = (t: string) => new Date(t).toDateString() === new Date().toDateString();

export default function Redeem({ slug, prefix, offer }: { slug: string; prefix: string; offer: string }) {
  const [code, setCode] = useState(""); const [hit, setHit] = useState<Found | null>(null); const [err, setErr] = useState(""); const [ok, setOk] = useState(""); const [pending, start] = useTransition();
  const clear = (msg: string) => { setHit(null); setCode(""); setOk(msg); };
  const g = hit?.guest;
  return (<div className="card" style={{ maxWidth: 560 }}><span className="t3">Check a guest at the table</span>
    <p className="c5" style={{ marginTop: 4 }}>Type the 4 numbers of their code, or their mobile number. Capitals and the dash don&apos;t matter.</p>
    <form className="row" style={{ marginTop: 16, flexWrap: "nowrap" }} noValidate onSubmit={(e) => { e.preventDefault(); setOk(""); setErr(""); setHit(null);
      if (!code.trim()) { setErr("Enter the guest's code or mobile number."); return; }
      start(async () => { const res = await findCode(slug, code); if ("error" in res) setErr(res.error!); else setHit(res as Found); }); }}>
      <input className="inp mono" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder={`4821, ${prefix}-4821 or mobile`} inputMode="text" aria-label="Guest code or mobile number" autoCapitalize="characters" />
      <button className="btn pri" disabled={pending}>Check</button></form>
    <div style={{ marginTop: 16, display: "grid", gap: 12 }} aria-live="polite">
      {err && <p className="err" style={{ fontSize: 14 }}>{err}</p>}
      {g && <div className="row"><div className="sp"><div className="t3">{g.name} <span className="chip mono">{g.code}</span></div>
        <div className="c5">{g.table_no ? `Table ${g.table_no} · ` : ""}joined {fmtDate(g.created_at)}{g.redeemed_at ? ` · ${offer} served ${fmtDate(g.redeemed_at)}` : ""}</div></div></div>}
      {g && !g.redeemed_at && <div className="choice"><div className="sp"><div className="t3">First visit: serve the {offer}</div><div className="c5">One tap marks the code as used.</div></div>
        <button className="btn pri sm" disabled={pending} onClick={() => start(async () => { await setRedeemed(slug, g.id, true); clear(`Marked as used. Enjoy the meal, ${firstName(g.name)}.`); })}>Mark redeemed</button></div>}
      {g && g.redeemed_at && <div className="choice"><div className="sp"><div className="t3">Came back{hit?.campaign ? ` for “${hit.campaign.name}”` : ""}?</div>
          <div className="c5">{hit?.lastReturn && sameDay(hit.lastReturn) ? "Already logged today." : hit?.campaign ? `Offer sent ${fmtDate(hit.campaign.created_at)}. Logging it shows on the dashboard.` : "Log a return visit so it counts on the dashboard."}</div></div>
        <button className="btn pri sm" disabled={pending || (!!hit?.lastReturn && sameDay(hit.lastReturn))} onClick={() => start(async () => {
          const res = await logReturn(slug, g.id, hit?.campaign?.id ?? null); if (res.error) setErr(res.error); else clear(`Welcome back, ${firstName(g.name)}. Return visit logged.`); })}>Log return visit</button></div>}
      {g && g.redeemed_at && <p className="c5">The first-visit {offer} was already used, so politely decline a second one unless an offer says otherwise.</p>}
      {ok && <p className="notice ok">{ok}</p>}
    </div></div>);
}
