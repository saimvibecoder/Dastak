"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { setState("error"); setMsg("Enter a full email address, like name@restaurant.in."); return; }
    setState("sending");
    const site = window.location.origin;
    const { error } = await supabaseBrowser().auth.signInWithOtp({ email: em, options: { emailRedirectTo: `${site}/auth/callback` } });
    if (error) { setState("error"); setMsg(error.status === 429 ? "Too many links asked for. Wait a minute and try again." : "We couldn't send the link. Check the address and try again."); return; }
    setState("sent");
  }
  if (state === "sent") return <p className="notice ok">Login link sent to {email}. Open it on this device to continue. It can take a minute to arrive; check spam too.</p>;
  return (
    <form className="stackform" onSubmit={submit} noValidate>
      <div className="field"><label htmlFor="em">Email</label>
        <input className={`inp ${state === "error" ? "bad" : ""}`} id="em" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@kebabkothi.in" />
        <div className="err" role="alert">{state === "error" ? msg : ""}</div></div>
      <button className="btn pri" type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending link" : "Email me a login link"}</button>
    </form>
  );
}
