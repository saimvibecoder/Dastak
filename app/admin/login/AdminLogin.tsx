"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function AdminLogin() {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [show, setShow] = useState(false);
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    if (!email.trim() || !pw) { setErr("Enter your email and password."); return; }
    setBusy(true);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: email.trim().toLowerCase(), password: pw });
    setBusy(false);
    if (error) { setErr(error.status === 429 ? "Too many tries. Wait a minute and try again." : "Email or password is wrong."); return; }
    window.location.assign("/admin");
  }
  return (<form className="stackform" onSubmit={submit} noValidate style={{ marginTop: 16 }}>
    <div className="field"><label htmlFor="aem">Email</label><input className="inp" id="aem" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
    <div className="field"><label htmlFor="apw">Password</label>
      <div className="row" style={{ flexWrap: "nowrap" }}><input className={`inp ${err ? "bad" : ""}`} id="apw" type={show ? "text" : "password"} autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <button type="button" className="btn ghost sm" onClick={() => setShow(!show)} aria-pressed={show}>{show ? "Hide" : "Show"}</button></div>
      <div className="err" role="alert">{err}</div></div>
    <button className="btn pri" type="submit" disabled={busy}>{busy ? "Checking" : "Log in"}</button>
  </form>);
}
