"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function VerifyForm() {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) { setErr("Enter the 6 digit code from your app."); return; }
    setBusy(true); setErr("");
    const sb = supabaseBrowser();
    const { data: f } = await sb.auth.mfa.listFactors();
    const factor = f?.totp?.[0];
    if (!factor) { setBusy(false); setErr("No authenticator app is set up for this account."); return; }
    const { error } = await sb.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
    if (error) { setBusy(false); setCode(""); setErr("That code didn't work. Codes change every 30 seconds, so try the newest one."); return; }
    window.location.replace("/app");
  }
  return (<form className="stackform" onSubmit={submit} noValidate>
    <div className="field"><label htmlFor="otp">6 digit code</label>
      <input className={`inp ${err ? "bad" : ""}`} id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus
        value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
      <div className="err" role="alert">{err}</div></div>
    <button className="btn pri" disabled={busy}>{busy ? "Checking…" : "Continue"}</button>
    <p className="c2" style={{ fontSize: 14 }}>Lost your phone? Ask Dastak support to reset two-step login for your account.</p>
  </form>);
}
