"use client";
import { useState } from "react";
// Go back to where the guest came from (the table page), or to dastak.food if they opened this link directly.
function Back() {
  const back = () => { if (window.history.length > 1 && document.referrer.startsWith(window.location.origin)) window.history.back(); else window.location.href = "/"; };
  return <button type="button" className="btn" style={{ marginTop: 16, width: "100%", justifyContent: "center" }} onClick={back}>&larr; Back</button>;
}
export default function StopForm({ slug, name }: { slug: string; name: string }) {
  const [phone, setPhone] = useState(""); const [err, setErr] = useState(""); const [ok, setOk] = useState(false); const [busy, setBusy] = useState(false); const [kept, setKept] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
    if (!/^[6-9]\d{9}$/.test(p)) { setErr("Enter a 10 digit Indian mobile number."); return; }
    setBusy(true); setErr("");
    const res = await fetch("/api/stop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug, phone: p }) }).catch(() => null);
    setBusy(false);
    if (!res || !res.ok) { const d = res ? await res.json().catch(() => ({})) : {}; setErr(d.error || "No connection. Try again."); return; }
    try { localStorage.removeItem(`dastak:code:${slug}`); } catch {}
    setOk(true);
  }
  if (kept) return (<div><p className="notice ok">You&apos;re still on {name}&apos;s list. Nothing has changed, and you can close this page.</p><Back /></div>);
  if (ok) return (<div><p className="notice ok">Done. If that number was on {name}&apos;s list, it has been removed from their offers.</p><Back /></div>);
  return (<form className="stackform" onSubmit={submit} noValidate>
    <div className="field"><label htmlFor="sp">WhatsApp number</label>
      <input className={`inp ${err ? "bad" : ""}`} id="sp" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98765 43210" />
      <div className="err" role="alert">{err}</div></div>
    <div className="row" style={{ gap: 12 }}>
      <button className="btn" type="button" onClick={() => setKept(true)}>Keep my offers</button>
      <button className="btn pri" type="submit" disabled={busy}>{busy ? "Saving" : "Stop offers"}</button></div>
    <p className="c5" style={{ marginTop: 16, textAlign: "center" }}><a href="/" style={{ color: "inherit" }}>Go to dastak.food</a></p></form>);
}
