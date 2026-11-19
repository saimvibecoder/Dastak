"use client";
import { useMemo, useState, useTransition } from "react";
import { wa, firstName, phoneFmt, initials } from "@/lib/util";
import { saveCampaign } from "../actions";

export type G = { id: string; name: string; phone: string; bm: number | null; joined: number; recent: boolean };
type Past = { id: string; name: string; audience: string; sent: number; at: string };
const AUD = [["all", "Everyone"], ["bday", "Birthdays this month"], ["lapsed", "Not visited in 30 days"], ["new", "Joined this week"]] as const;

export default function Composer({ slug, r, stopUrl, slot, guests, past }: { slug: string; r: { name: string; offer: string }; stopUrl: string; slot: string; guests: G[]; past: Past[] }) {
  const TPL = useMemo(() => [
    { n: "Slow hour deal", t: `Hi {name}, quiet afternoon at ${r.name} today. Show this message ${slot ? `on ${slot}` : "between 4 and 6 PM"} and get 20% off your bill.` },
    { n: "Birthday treat", t: `Happy birthday month, {name}! Your dessert at ${r.name} is on us any day this month. Just show this message.` },
    { n: "Weekend special", t: `Hi {name}, this weekend at ${r.name}: our chef's special is back from 8 PM. Reply here to book a table.` },
    { n: "Festival", t: `Festive greetings, {name}! Our festive menu is on at ${r.name} for three days. Reply to reserve a table.` },
    { n: "We miss you", t: `Hi {name}, it's been a while! Come back to ${r.name} this week and your ${r.offer} is on us again.` },
  ], [r, slot]);
  const [tpl, setTpl] = useState(0); const [msg, setMsg] = useState(TPL[0].t); const [aud, setAud] = useState<(typeof AUD)[number][0]>("all");
  const [sent, setSent] = useState<Record<string, true>>({}); const [note, setNote] = useState(""); const [pending, start] = useTransition();
  const month = new Date().getMonth() + 1, week = Date.now() - 7 * 864e5, old = Date.now() - 30 * 864e5;
  const pick = (k: string) => k === "bday" ? guests.filter((g) => g.bm === month) : k === "lapsed" ? guests.filter((g) => !g.recent && g.joined < old) : k === "new" ? guests.filter((g) => g.joined > week) : guests;
  const list = pick(aud);
  const full = (g?: G) => `${msg.replace(/\{name\}/g, g ? firstName(g.name) : "Sana")}\n\nTo stop offers: ${stopUrl}`;
  const copy = (txt: string, ok: string) => navigator.clipboard.writeText(txt).then(() => setNote(ok), () => setNote("Copy was blocked. Select the text and copy it by hand."));
  const n = Object.keys(sent).length;
  return (<>
    <div className="grid g2">
      <div className="card"><span className="t3">1. Choose the offer</span>
        <div className="row" style={{ margin: "12px 0 16px", gap: 8 }}>{TPL.map((x, i) => <button key={x.n} className={`btn ghost sm ${i === tpl ? "on" : ""}`} aria-pressed={i === tpl} onClick={() => { setTpl(i); setMsg(x.t); }}>{x.n}</button>)}</div>
        <div className="field"><label htmlFor="msg">Message <span className="c5">({"{name}"} becomes each guest&apos;s first name; a stop link is added)</span></label>
          <textarea className="inp" id="msg" value={msg} maxLength={900} onChange={(e) => setMsg(e.target.value)} /></div>
        <span className="t3" style={{ display: "block", marginTop: 24 }}>2. Choose who gets it</span>
        <div className="row" style={{ marginTop: 12, gap: 8 }}>{AUD.map(([k, l]) => <button key={k} className={`btn ghost sm ${k === aud ? "on" : ""}`} aria-pressed={k === aud} onClick={() => { setAud(k); setSent({}); }}>{l} · {pick(k).length}</button>)}</div>
        {slot && <p className="c2" style={{ marginTop: 16 }}>Targeting the slow slot: <b className="t3" style={{ color: "var(--fg)" }}>{slot}</b></p>}
      </div>
      <div className="card"><span className="t3">Preview</span><div className="phone" style={{ marginTop: 12 }}><div className="bubble">{full(list[0])}</div></div>
        <div className="row" style={{ marginTop: 16 }}><button className="btn ghost sm" onClick={() => copy(list.map((g) => "+91" + g.phone).join("\n"), `${list.length} numbers copied`)}>Copy {list.length} numbers</button>
          <button className="btn ghost sm" onClick={() => copy(full(), "Message copied")}>Copy message</button></div>
        <p className="c5" style={{ marginTop: 8 }}>For a big list, paste the numbers into a WhatsApp Business broadcast list and send once.</p>
        {note && <p className="notice ok" role="status" style={{ marginTop: 12 }}>{note}</p>}</div>
    </div>
    <div className="card" style={{ marginTop: 16 }}><div className="row"><span className="t3">3. Send one by one</span><span className="sp"></span><span className="c2 mono">{list.filter((g) => sent[g.id]).length} of {list.length} sent</span></div>
      {list.length ? <div style={{ marginTop: 8 }}>{list.slice(0, 100).map((g) => (
        <div className={`qitem ${sent[g.id] ? "done" : ""}`} key={g.id}><span className="av">{initials(g.name)}</span><div className="sp"><div className="t3 b6">{g.name}</div><div className="c5 mono">{phoneFmt(g.phone)}</div></div>
          <a className="btn wa sm" target="_blank" rel="noopener" href={wa("91" + g.phone, full(g))} onClick={() => setSent((s) => ({ ...s, [g.id]: true }))}>{sent[g.id] ? "Sent" : "Send"}</a></div>))}
        {list.length > 100 && <p className="c5" style={{ marginTop: 12 }}>Showing 100 of {list.length}. Use copy numbers for the rest.</p>}</div>
      : <div className="empty"><p className="t3" style={{ color: "var(--fg)" }}>Nobody in this group yet</p><p className="c2">Pick another audience, or wait for more guests to join from the tables.</p></div>}
      <button className="btn pri" style={{ marginTop: 16 }} disabled={pending || !n} onClick={() => start(async () => {
        const res = await saveCampaign(slug, { name: TPL[tpl].n, audience: AUD.find((a) => a[0] === aud)![1], message: msg, sent: n });
        setNote(res.error ?? `Campaign saved: ${n} messages`); if (!res.error) setSent({}); })}>{n ? `Save campaign (${n} sent)` : "Send to a guest to save a campaign"}</button>
    </div>
    {past.length > 0 && <div className="card" style={{ marginTop: 16 }}><span className="t3">Past campaigns</span>{past.map((c) => (
      <div className="qitem" key={c.id}><div className="sp"><div className="t3 b6">{c.name}</div><div className="c5">{c.at} · {c.audience}</div></div><span className="chip mono">{c.sent} sent</span></div>))}</div>}
  </>);
}
