"use client";
import { useEffect, useState } from "react";

type Stage = "processing" | "printing" | "complete";
const LABEL: Record<Stage, string> = { processing: "Checking your table", printing: "Printing your pass", complete: "Your pass is ready" };

/** A small receipt printer that prints the guest's pass. Static for reduced motion or a restored pass. */
export default function ReceiptPass({ restaurant, area, table, offer, code, at, fresh }: {
  restaurant: string; area: string | null; table: number | null; offer: string; code: string; at: number; fresh: boolean;
}) {
  const [stage, setStage] = useState<Stage>(fresh ? "processing" : "complete");
  useEffect(() => {
    if (!fresh) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setStage("complete"); return; }
    const a = setTimeout(() => setStage("printing"), 700);
    const b = setTimeout(() => setStage("complete"), 700 + 1750);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [fresh]);
  const d = new Date(at);
  const date = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
  const time = d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

  return (
    <section className="rp" data-stage={stage} aria-label={`Guest pass for ${restaurant}`}>
      <div className="rp-machine">
        <div className="rp-head"><span className="rp-brand">{restaurant}</span><span className="rp-led" aria-hidden="true" /></div>
        <div className="rp-screen">
          <div className="rp-status" role="status" aria-live="polite">
            <span className="rp-ico" aria-hidden="true">{stage === "complete" ? <svg viewBox="0 0 20 20" width="16" height="16"><circle cx="10" cy="10" r="9" fill="currentColor" /><path d="M6 10.5l2.5 2.5L14 7.5" stroke="#1c120c" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg> : <span className="rp-spin" />}</span>
            <span key={stage} className="rp-label">{LABEL[stage]}</span>
          </div>
        </div>
        <div className="rp-slot" aria-hidden="true" />
      </div>
      <div className="rp-out">
        <article className="rp-paper" aria-hidden={stage !== "complete"}>
          <div className="rp-center"><b>{restaurant.toUpperCase()}</b>{area && <div>{area}</div>}</div>
          <div className="rp-rule" />
          <div className="rp-row"><span>{date}</span><span>{time}</span></div>
          <div className="rp-row"><span>{table ? `TABLE ${table}` : "GUEST PASS"}</span><span>WELCOME</span></div>
          <div className="rp-rule" />
          <div className="rp-row"><span>1 x {offer}</span><span>FREE</span></div>
          <div className="rp-rule" />
          <div className="rp-center rp-small">YOUR CODE</div>
          <div className="rp-code">{code}</div>
          <div className="rp-center rp-small">Show this to your server</div>
          <div className="rp-rule" />
          <div className="rp-center rp-small">Thanks for joining the guest list<br />· powered by Dastak ·</div>
        </article>
      </div>
    </section>
  );
}
