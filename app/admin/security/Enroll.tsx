"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function Enroll() {
  const [f, setF] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      // Clear half-finished setups from earlier attempts, then start a fresh one.
      const { data: list } = await sb.auth.mfa.listFactors();
      for (const x of list?.all ?? []) if (x.status !== "verified") await sb.auth.mfa.unenroll({ factorId: x.id });
      const { data, error } = await sb.auth.mfa.enroll({ factorType: "totp", friendlyName: "Dastak admin" });
      if (error || !data) { setErr("Couldn't start setup. Refresh the page and try again."); return; }
      setF({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
    })();
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f) return;
    if (!/^\d{6}$/.test(code)) { setErr("Enter the 6 digit code your app shows."); return; }
    setBusy(true); setErr("");
    const { error } = await supabaseBrowser().auth.mfa.challengeAndVerify({ factorId: f.id, code });
    if (error) { setBusy(false); setCode(""); setErr("That code didn't work. Try the newest code in the app."); return; }
    window.location.replace("/admin/security");
  }
  if (!f) return <p className="c2" role="status">{err || "Preparing your code…"}</p>;
  return (<form className="stackform" onSubmit={submit} noValidate>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={f.qr} alt="QR code to add Dastak to your authenticator app" width={192} height={192} style={{ background: "#fff", borderRadius: 12, padding: 8, margin: "0 auto" }} />
    <p className="c2" style={{ fontSize: 14, textAlign: "center" }}>Can&apos;t scan? Enter this key in the app: <span className="mono" style={{ wordBreak: "break-all" }}>{f.secret}</span></p>
    <div className="field"><label htmlFor="otp">Code from the app</label>
      <input className={`inp ${err ? "bad" : ""}`} id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
        value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
      <div className="err" role="alert">{err}</div></div>
    <button className="btn pri" disabled={busy}>{busy ? "Checking…" : "Turn on two-step login"}</button>
  </form>);
}
