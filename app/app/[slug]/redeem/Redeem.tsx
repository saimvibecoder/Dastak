"use client";
import { useState, useTransition } from "react";
import { findCode, setRedeemed } from "../actions";
import { fmtDate } from "@/lib/util";

type Guest = { id: string; name: string; table_no: number | null; created_at: string; redeemed_at: string | null; code: string };
export default function Redeem({ slug, prefix, offer }: { slug: string; prefix: string; offer: string }) {
  const [code, setCode] = useState(""); const [g, setG] = useState<Guest | null>(null); const [err, setErr] = useState(""); const [ok, setOk] = useState(""); const [pending, start] = useTransition();
  return (<div className="card" style={{ maxWidth: 520 }}><span className="t3">Check a guest&apos;s code at the table</span>
    <form className="row" style={{ marginTop: 16, flexWrap: "nowrap" }} noValidate onSubmit={(e) => { e.preventDefault(); setOk(""); setErr(""); setG(null);
      if (!code.trim()) { setErr("Enter the code the guest shows you."); return; }
      start(async () => { const res = await findCode(slug, code); if ("error" in res) setErr(res.error!); else setG(res.guest as Guest); }); }}>
      <input className="inp mono" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder={`${prefix}-4821`} aria-label="Guest code" autoCapitalize="characters" />
      <button className="btn pri" disabled={pending}>Check</button></form>
    <div style={{ marginTop: 16 }} aria-live="polite">
      {err && <p className="err" style={{ fontSize: 14 }}>{err}</p>}
      {g && (g.redeemed_at ? <p className="c2"><b className="t3" style={{ color: "var(--fg)" }}>{g.name}</b> already used this code on {fmtDate(g.redeemed_at)}. Politely decline a second {offer}.</p>
        : <div className="row"><div className="sp"><div className="t3">{g.name}</div><div className="c5">{g.table_no ? `Table ${g.table_no} · ` : ""}joined {fmtDate(g.created_at)}</div></div>
            <button className="btn pri sm" disabled={pending} onClick={() => start(async () => { await setRedeemed(slug, g.id, true); setG(null); setCode(""); setOk(`Marked as used. Enjoy the meal, ${g.name.split(" ")[0]}.`); })}>Serve the {offer}</button></div>)}
      {ok && <p className="notice ok">{ok}</p>}
    </div></div>);
}
