"use client";
import { useMemo, useRef, useState } from "react";
import { wa, firstName, phoneFmt, initials } from "@/lib/util";
import { startCampaign, countSent } from "../actions";

export type G = { id: string; name: string; phone: string; code: string; bm: number | null; joined: number; recent: boolean };
type Past = { id: string; name: string; audience: string; sent: number; at: string };
const AUD = [["all", "Everyone"], ["bday", "Birthdays this month"], ["lapsed", "Not visited in 30 days"], ["new", "Joined this week"]] as const;

export default function Composer({ slug, r, stopUrl, slot, startTpl, guests, past }: { slug: string; r: { name: string; offer: string }; stopUrl: string; slot: string; startTpl: number; guests: G[]; past: Past[] }) {
  const TPL = useMemo(() => [
    { n: "Slow weekday lunch", t: `Hi {name}, lunch is quiet at ${r.name} today. Come in between 12 and 3 PM and get 15% off your bill. Just show this message to your server.` },
    { n: "Quiet evening", t: `Hi {name}, we have tables free at ${r.name} this evening. Come in between 6 and 9 PM and dessert is on us. Just show this message to your server.` },
    { n: "Come back this week", t: `Hi {name}, we'd love to see you again at ${r.name}. Visit any day this week and get 10% off your bill. Just show this message to your server.` },
    { n: "Birthday treat", t: `Happy birthday month, {name}! Your dessert at ${r.name} is on us any day this month. Just show this message to your server.` },
    { n: "Festival", t: `Festive greetings, {name}! Our festive menu is on at ${r.name} for three days. Reply here to reserve a table.` },
  ], [r]);
  const [tpl, setTpl] = useState(startTpl); const [msg, setMsg] = useState(TPL[startTpl].t); const [aud, setAud] = useState<(typeof AUD)[number][0]>("all");
  const [sent, setSent] = useState<Record<string, true>>({}); const [note, setNote] = useState("");
  const camp = useRef<{ id: string; key: string } | null>(null);
  const month = new Date().getMonth() + 1, week = Date.now() - 7 * 864e5, old = Date.now() - 30 * 864e5;
  const pick = (k: string) => k === "bday" ? guests.filter((g) => g.bm === month) : k === "lapsed" ? guests.filter((g) => !g.recent && g.joined < old) : k === "new" ? guests.filter((g) => g.joined > week) : guests;
  const list = pick(aud);
  const full = (g?: G) => `${msg.replace(/\{name\}/g, g ? firstName(g.name) : "there")}${g ? `\n\nYour guest code: ${g.code}` : ""}\n\nTo stop offers: ${stopUrl}`;
  const broadcastText = `${msg.replace(/\{name\}/g, "there").replace(/^Hi there,/, "Hi,")}\n\nTo stop offers: ${stopUrl}`;
  const copy = (txt: string, ok: string) => navigator.clipboard.writeText(txt).then(() => { setNote(ok); return true; }, () => { setNote("Copy was blocked. Select the text and copy it by hand."); return false; });
  const audLabel = AUD.find((a) => a[0] === aud)![1];

  // Every send is counted on the dashboard. The offer is saved the first time it goes out.
  async function record(total: number) {
    const key = `${tpl}|${aud}|${msg}`;
    if (!camp.current || camp.current.key !== key) {
      const res = await startCampaign(slug, { name: TPL[tpl].n, audience: audLabel, message: msg });
      if ("error" in res) { setNote(res.error!); return; }
      camp.current = { id: res.id!, key };
    }
    await countSent(slug, camp.current.id, total);
  }
  const markSent = (g: G) => setSent((s) => { const n = { ...s, [g.id]: true as const }; void record(list.filter((x) => n[x.id]).length); return n; });
  const next = list.find((g) => !sent[g.id]);
  const n = list.filter((g) => sent[g.id]).length;
  const reset = () => { setSent({}); camp.current = null; };

  return (<>
    <div className="grid g2">
      <div className="card"><span className="t3">1. Pick an offer</span>
        <div className="row" style={{ margin: "12px 0 16px", gap: 8 }}>{TPL.map((x, i) => <button key={x.n} className={`btn ghost sm ${i === tpl ? "on" : ""}`} aria-pressed={i === tpl} onClick={() => { setTpl(i); setMsg(x.t); reset(); }}>{x.n}</button>)}</div>
        <div className="field"><label htmlFor="msg">Message <span className="c5">(edit the offer to suit you; {"{name}"} becomes each guest&apos;s first name)</span></label>
          <textarea className="inp" id="msg" value={msg} maxLength={900} onChange={(e) => { setMsg(e.target.value); reset(); }} /></div>
        <span className="t3" style={{ display: "block", marginTop: 24 }}>2. Choose who gets it</span>
        <div className="row" style={{ marginTop: 12, gap: 8 }}>{AUD.map(([k, l]) => <button key={k} className={`btn ghost sm ${k === aud ? "on" : ""}`} aria-pressed={k === aud} onClick={() => { setAud(k); reset(); }}>{l} · {pick(k).length}</button>)}</div>
        {slot && <p className="c2" style={{ marginTop: 16 }}>Filling the slow slot: <b className="t3" style={{ color: "var(--fg)" }}>{slot}</b></p>}
      </div>
      <div className="card"><span className="t3">Preview</span><div className="phone" style={{ marginTop: 12 }}><div className="bubble">{full(list[0])}</div></div>
        <p className="c5" style={{ marginTop: 8 }}>Each guest&apos;s own code is added, so staff can log them when they come back. A stop link is always added.</p></div>
    </div>

    <div className="card" style={{ marginTop: 16 }}>
      <div className="row"><span className="t3">3. Send</span><span className="sp"></span><span className="c2 mono">{n} of {list.length} sent</span></div>
      {list.length ? <>
        {next ? <a className="btn wa" style={{ marginTop: 12, width: "100%", justifyContent: "center" }} target="_blank" rel="noopener" href={wa("91" + next.phone, full(next))} onClick={() => markSent(next)}>
          Send to {firstName(next.name)} <span className="mono" style={{ opacity: .8 }}>({n + 1} of {list.length})</span></a>
          : <p className="notice ok" style={{ marginTop: 12 }}>Sent to everyone in this group. It now shows on your dashboard.</p>}
        <p className="c5" style={{ marginTop: 8 }}>Tap, send in WhatsApp, come back, tap again. About 5 seconds a guest.</p>
        <details style={{ marginTop: 16 }}><summary className="t3" style={{ cursor: "pointer" }}>Sending to a big list? Use a broadcast</summary>
          <p className="c2" style={{ marginTop: 8 }}>In WhatsApp Business, make a broadcast list with these numbers and send the message once. Broadcasts only reach guests who have saved your number.</p>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn ghost sm" onClick={() => copy(list.map((g) => "+91" + g.phone).join("\n"), `${list.length} numbers copied`)}>Copy {list.length} numbers</button>
            <button className="btn ghost sm" onClick={async () => { if (await copy(broadcastText, "Message copied, and counted as sent to this group")) { setSent(Object.fromEntries(list.map((g) => [g.id, true as const]))); void record(list.length); } }}>Copy message</button></div>
        </details>
        <details style={{ marginTop: 12 }}><summary className="c2" style={{ cursor: "pointer" }}>See the list</summary>
          <div style={{ marginTop: 8 }}>{list.slice(0, 100).map((g) => (
            <div className={`qitem ${sent[g.id] ? "done" : ""}`} key={g.id}><span className="av">{initials(g.name)}</span><div className="sp"><div className="t3 b6">{g.name}</div><div className="c5 mono">{phoneFmt(g.phone)}</div></div>
              <a className="btn wa sm" target="_blank" rel="noopener" href={wa("91" + g.phone, full(g))} onClick={() => markSent(g)}>{sent[g.id] ? "Sent" : "Send"}</a></div>))}
            {list.length > 100 && <p className="c5" style={{ marginTop: 12 }}>Showing 100 of {list.length}. The send button above goes through everyone.</p>}</div></details>
      </> : <div className="empty"><p className="t3" style={{ color: "var(--fg)" }}>Nobody in this group yet</p><p className="c2">Pick another group, or wait for more guests to join from the tables.</p></div>}
      {note && <p className="notice ok" role="status" style={{ marginTop: 12 }}>{note}</p>}
    </div>
    {past.length > 0 && <div className="card" style={{ marginTop: 16 }}><span className="t3">Past offers</span>{past.map((c) => (
      <div className="qitem" key={c.id}><div className="sp"><div className="t3 b6">{c.name}</div><div className="c5">{c.at} · {c.audience}</div></div><span className="chip mono">{c.sent} sent</span></div>))}</div>}
  </>);
}
