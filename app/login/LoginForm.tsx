"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function send(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    const em = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { setErr("Enter a full email address, like name@restaurant.in."); return; }
    setBusy(true);
    const { error } = await supabaseBrowser().auth.signInWithOtp({ email: em, options: { emailRedirectTo: `${window.location.origin}/auth/finish` } });
    setBusy(false);
    if (error) { setErr(error.status === 429 ? "Too many emails asked for. Wait a minute and try again." : "We couldn't send the email. Check the address and try again."); return; }
    setEmail(em); setStep("code");
  }
  async function verify(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    const t = code.replace(/\D/g, "");
    if (t.length < 6) { setErr("Enter the code from the email."); return; }
    setBusy(true);
    const { error } = await supabaseBrowser().auth.verifyOtp({ email, token: t, type: "email" });
    setBusy(false);
    if (error) { setErr("That code is wrong or has expired. Check the latest email, or ask for a new one."); return; }
    window.location.assign("/app");
  }

  async function withPassword(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    const em = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em) || !pw) { setErr("Enter your email and password."); return; }
    setBusy(true);
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email: em, password: pw });
    setBusy(false);
    if (error) { setErr(error.status === 429 ? "Too many tries. Wait a minute and try again." : "Email or password is wrong."); return; }
    window.location.assign("/app");
  }

  if (step === "password") return (
    <form className="stackform" onSubmit={withPassword} noValidate>
      <div className="field"><label htmlFor="pem">Email</label><input className="inp" id="pem" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="field"><label htmlFor="ppw">Password</label><input className={`inp ${err ? "bad" : ""}`} id="ppw" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <div className="err" role="alert">{err}</div></div>
      <button className="btn pri" type="submit" disabled={busy}>{busy ? "Checking" : "Log in"}</button>
      <button className="btn ghost" type="button" onClick={() => { setStep("email"); setErr(""); setPw(""); }}>Use an email code instead</button>
    </form>
  );
  if (step === "code") return (
    <form className="stackform" onSubmit={verify} noValidate>
      <p className="notice ok">We emailed a code to {email}. Type it here, or tap the link in the same email. It can take a minute; check spam too.</p>
      <div className="field"><label htmlFor="otp">Login code</label>
        <input className={`inp mono ${err ? "bad" : ""}`} id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={10} value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" style={{ letterSpacing: ".2em", fontSize: 20 }} />
        <div className="err" role="alert">{err}</div></div>
      <button className="btn pri" type="submit" disabled={busy}>{busy ? "Checking" : "Log in"}</button>
      <button className="btn ghost" type="button" onClick={() => { setStep("email"); setCode(""); setErr(""); }}>Use a different email</button>
    </form>
  );
  return (
    <form className="stackform" onSubmit={send} noValidate>
      <div className="field"><label htmlFor="em">Email</label>
        <input className={`inp ${err ? "bad" : ""}`} id="em" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@kebabkothi.in" />
        <div className="err" role="alert">{err}</div></div>
      <button className="btn pri" type="submit" disabled={busy}>{busy ? "Sending" : "Email me a login code"}</button>
      <button className="btn ghost" type="button" onClick={() => { setStep("password"); setErr(""); }}>Log in with password</button>
    </form>
  );
}
