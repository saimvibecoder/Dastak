"use client";
import { useActionState } from "react";
import { setPlan } from "./actions";

export const PLANS: Record<string, string> = { pilot: "Pilot (free)", standard: "Standard", done_for_you: "Done-for-you", yearly: "Yearly", paused: "Paused" };
const DEFAULTS: Record<string, [string, string]> = { pilot: ["", ""], standard: ["10000", "1000"], done_for_you: ["10000", "2000"], yearly: ["20000", "0"], paused: ["", ""] };
const inr = (n: number | null) => (n == null ? "" : `₹${n.toLocaleString("en-IN")}`);

export default function PlanEditor({ slug, plan, setup, monthly, note }: { slug: string; plan: string; setup: number | null; monthly: number | null; note: string | null }) {
  const [s, act, pending] = useActionState(setPlan, null as null | { ok?: string; error?: string });
  const summary = plan === "pilot" || plan === "paused" ? PLANS[plan] : `${PLANS[plan]} · ${monthly ? `${inr(monthly)}/mo` : plan === "yearly" ? `${inr(setup)}/yr` : ""}`;
  return (<details className="plan"><summary className={`chip ${plan === "pilot" ? "" : plan === "paused" ? "wn" : "ok"}`} style={{ cursor: "pointer" }}>{summary}</summary>
    <form action={act} className="stackform" style={{ marginTop: 8, minWidth: 220 }} onChange={(e) => {
      const t = e.target as unknown as HTMLSelectElement; if (t.name !== "plan") return; const f = t.form!; const [a, b] = DEFAULTS[t.value];
      (f.elements.namedItem("setup") as HTMLInputElement).value = a; (f.elements.namedItem("monthly") as HTMLInputElement).value = b; }}>
      <input type="hidden" name="slug" value={slug} />
      <div className="field"><label htmlFor={`p-${slug}`}>Plan</label><select className="inp" id={`p-${slug}`} name="plan" defaultValue={plan}>{Object.entries(PLANS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
      <div className="row" style={{ gap: 8, flexWrap: "nowrap" }}>
        <div className="field sp"><label htmlFor={`s-${slug}`}>{plan === "yearly" ? "Yearly ₹" : "Setup ₹"}</label><input className="inp mono" id={`s-${slug}`} name="setup" inputMode="numeric" defaultValue={setup ?? ""} /></div>
        <div className="field sp"><label htmlFor={`m-${slug}`}>Monthly ₹</label><input className="inp mono" id={`m-${slug}`} name="monthly" inputMode="numeric" defaultValue={monthly ?? ""} /></div></div>
      <div className="field"><label htmlFor={`n-${slug}`}>Note</label><input className="inp" id={`n-${slug}`} name="note" maxLength={200} defaultValue={note ?? ""} placeholder="Agreed discount, start date" /></div>
      <button className="btn pri sm" disabled={pending}>{pending ? "Saving" : "Save plan"}</button>
      {s?.error && <p className="err">{s.error}</p>}{s?.ok && <p className="c5">{s.ok}</p>}
    </form></details>);
}
