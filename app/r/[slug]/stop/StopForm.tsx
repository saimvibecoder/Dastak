"use client";
import { useState } from "react";
export default function StopForm({ slug, name }: { slug: string; name: string }) {
  const [phone, setPhone] = useState(""); const [err, setErr] = useState(""); const [ok, setOk] = useState(false); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
    if (!/^[6-9]\d{9}$/.test(p)) { setErr("Enter a 10 digit Indian mobile number."); return; }
    setBusy(true); setErr("");
    const res = await fetch("/api/stop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug, phone: p }) }).catch(() => null);
    setBusy(false);
    if (!res || !res.ok) { const d = res ? await res.json().catch(() => ({})) : {}; setErr(d.error || "No connection. Try again."); return; }
    setOk(true);
  }
  if (ok) return <p className="notice ok">Done. If that number was on {name}&apos;s list, it has been removed from their offers.</p>;
  return (<form className="stackform" onSubmit={submit} noValidate>
    <div className="field"><label htmlFor="sp">WhatsApp number</label>
      <input className={`inp ${err ? "bad" : ""}`} id="sp" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98765 43210" />
      <div className="err" role="alert">{err}</div></div>
    <button className="btn pri" type="submit" disabled={busy}>{busy ? "Saving" : "Stop offers"}</button></form>);
}
