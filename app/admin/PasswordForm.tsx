"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

// Only shown on the admin page, so only admins can give their account a password.
export default function PasswordForm() {
  const [pw, setPw] = useState(""); const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState<{ ok?: string; err?: string }>({}); const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setMsg({});
    if (pw.length < 10) { setMsg({ err: "Use at least 10 characters." }); return; }
    if (pw !== pw2) { setMsg({ err: "The two passwords don't match." }); return; }
    setBusy(true);
    const { error } = await supabaseBrowser().auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { setMsg({ err: error.message.includes("weak") || error.message.includes("Password") ? error.message : "Couldn't save the password. Log out, log in again with a code, and retry." }); return; }
    setPw(""); setPw2(""); setMsg({ ok: "Password saved. Next time, use \"Log in with password\" on the login page." });
  }
  return (<form className="stackform" onSubmit={save} style={{ marginTop: 16 }} noValidate>
    <div className="field"><label htmlFor="np">New password</label><input className="inp" id="np" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
    <div className="field"><label htmlFor="np2">Type it again</label><input className="inp" id="np2" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
    {msg.err && <p className="notice err" role="alert">{msg.err}</p>}{msg.ok && <p className="notice ok" role="status">{msg.ok}</p>}
    <button className="btn pri" disabled={busy}>{busy ? "Saving" : "Save password"}</button>
    <p className="c5">Owners and staff keep logging in with email codes. Only this admin page offers a password.</p>
  </form>);
}
