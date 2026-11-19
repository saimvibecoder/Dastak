"use client";
import { useEffect, useState } from "react";
import { wa, firstName } from "@/lib/util";

type R = { name: string; area: string | null; offer: string; whatsapp: string | null };
export default function ClaimForm({ slug, table, r }: { slug: string; table: number | null; r: R }) {
  const [f, setF] = useState({ name: "", phone: "", bday: "", consent: false, website: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ code: string } | null>(null);
  const [server, setServer] = useState("");
  const [copied, setCopied] = useState(false);
  const key = `dastak:code:${slug}`;
  // If the guest scans again or reopens the page, show the code they already got.
  useEffect(() => { try { const v = JSON.parse(localStorage.getItem(key) || "null"); if (v?.code) { setDone({ code: v.code }); setF((x) => ({ ...x, name: v.name || x.name })); } } catch {} }, [key]);
  async function copy() {
    if (!done) return;
    try { await navigator.clipboard.writeText(done.code); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setCopied(false); }
  }
  const where = [r.name, r.area].filter(Boolean).join(" · ") + (table ? ` · Table ${table}` : "");

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setServer("");
    const phone = f.phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
    const er: Record<string, string> = {};
    if (f.name.trim().length < 2) er.name = "Enter your name so the server can greet you.";
    if (!/^[6-9]\d{9}$/.test(phone)) er.phone = "Enter a 10 digit Indian mobile number.";
    if (!f.consent) er.consent = "Tick the box to join the list and claim the offer.";
    setErrs(er); if (Object.keys(er).length) return;
    setBusy(true);
    const res = await fetch("/api/claim", { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, table, name: f.name.trim(), phone, bday: f.bday, consent: true, website: f.website }) }).catch(() => null);
    setBusy(false);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (!res || !res.ok) { setServer(data.error || "No connection. Check your internet and try again."); return; }
    setDone({ code: data.code });
    try { localStorage.setItem(key, JSON.stringify({ code: data.code, name: f.name.trim() })); } catch {}
  }

  if (done) return (
    <div className="gcard">
      <div className="gtop"><div className="c5" style={{ color: "inherit", opacity: .8 }}>{where}</div>
        <h1 style={{ marginTop: 12 }}>You&apos;re on the list{f.name.trim() ? `, ${firstName(f.name.trim())}` : ""}</h1>
        <p>Show this code to your server for your {r.offer}.</p></div>
      <div className="gbody">
        <div className="code mono" aria-label={`Your code is ${done.code}`}>{done.code}</div>
        <button type="button" className="btn" onClick={copy}>{copied ? "Copied" : "Copy code"}</button>
        <p className="c2" style={{ textAlign: "center" }} aria-live="polite">Take a screenshot or copy the code. You&apos;ll show it when your food arrives. Scanning the table card again also brings it back.</p>
        {r.whatsapp && <>
          <a className="btn wa" target="_blank" rel="noopener" href={wa(r.whatsapp, `Hi ${r.name}, I'm ${f.name.trim()}${table ? ` at table ${table}` : ""}. My code is ${done.code}.`)}>Save {r.name} on WhatsApp</a>
          <p className="c2" style={{ textAlign: "center" }}>Saving the chat means their offers reach you, not your spam folder.</p></>}
      </div>
    </div>
  );

  return (
    <div className="gcard">
      <div className="gtop"><div className="c5" style={{ color: "inherit", opacity: .8 }}>{where}</div>
        <h1 style={{ marginTop: 12 }}>A {r.offer}, on us</h1>
        <p>Join our guest list on WhatsApp and get it with this meal.</p></div>
      <form className="gbody" onSubmit={submit} noValidate>
        <div className="field"><label htmlFor="gn">Your name</label>
          <input className={`inp ${errs.name ? "bad" : ""}`} id="gn" autoComplete="name" value={f.name} maxLength={60} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Sana Rizvi" />
          <div className="err">{errs.name}</div></div>
        <div className="field"><label htmlFor="gp">WhatsApp number</label>
          <div className="row" style={{ flexWrap: "nowrap" }}><span className="inp" style={{ width: "auto", flex: "none" }}>+91</span>
            <input className={`inp ${errs.phone ? "bad" : ""}`} id="gp" inputMode="numeric" autoComplete="tel-national" maxLength={14} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="98765 43210" /></div>
          <div className="err">{errs.phone}</div></div>
        <div className="field"><label htmlFor="gb">Birthday <span className="c5">(optional, for a birthday treat)</span></label>
          <input className="inp" id="gb" type="date" value={f.bday} onChange={(e) => setF({ ...f, bday: e.target.value })} /></div>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} style={{ position: "absolute", left: -9999, width: 1, height: 1 }} />
        <label className="ck"><input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} /> <span>Send me offers from {r.name} on WhatsApp. I can leave the list any time.</span></label>
        <div className="err">{errs.consent}</div>
        {server && <p className="notice err" role="alert">{server}</p>}
        <button className="btn pri" type="submit" disabled={busy}>{busy ? "Saving" : "Claim my free dish"}</button>
      </form>
    </div>
  );
}
