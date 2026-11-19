"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function Finish() {
  const [state, setState] = useState<"working" | "failed">("working");
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (hash.get("error")) { setState("failed"); return; }
    const sb = supabaseBrowser();
    let done = false;
    const go = () => { if (!done) { done = true; window.location.replace("/app"); } };
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => { if (session) go(); });
    sb.auth.getSession().then(({ data }) => { if (data.session) go(); });
    const t = setTimeout(() => { if (!done) setState("failed"); }, 8000);
    return () => { sub.subscription.unsubscribe(); clearTimeout(t); };
  }, []);
  if (state === "failed") return (<>
    <h1 style={{ fontSize: 30, lineHeight: "36px" }}>That link didn&apos;t work</h1>
    <p className="c2" style={{ margin: "12px 0 24px" }}>Login links work once and expire after an hour. Ask for a new one and open the newest email.</p>
    <Link className="btn pri" href="/login">Get a new link</Link></>);
  return (<><h1 style={{ fontSize: 30, lineHeight: "36px" }}>Logging you in</h1><p className="c2" style={{ marginTop: 12 }}>One moment.</p></>);
}
