"use client";
import { useActionState, useTransition } from "react";
import { useState } from "react";
import { saveSettings, saveSlowSlots, invite, cancelInvite, removeMember } from "../actions";
import { PARTS, type Slot } from "@/lib/slots";
import { DAYS } from "@/lib/util";
import { PALETTES } from "@/lib/palettes";
import type { Restaurant } from "@/lib/data";

type S = { error?: string; ok?: string } | null;
const Msg = ({ s }: { s: S }) => s?.error ? <p className="notice err" role="alert">{s.error}</p> : s?.ok ? <p className="notice ok" role="status">{s.ok}</p> : null;

export function SettingsForm({ slug, r }: { slug: string; r: Restaurant }) {
  const [s, act, pending] = useActionState<S, FormData>(saveSettings.bind(null, slug) as (p: S, f: FormData) => Promise<S>, null);
  return (<form action={act} className="stackform" style={{ marginTop: 16 }}>
    <div className="field"><label htmlFor="n">Name</label><input className="inp" id="n" name="name" defaultValue={r.name} required maxLength={60} /></div>
    <div className="field"><label htmlFor="a">Area</label><input className="inp" id="a" name="area" defaultValue={r.area ?? ""} maxLength={60} placeholder="Aminabad" /></div>
    <div className="field"><label htmlFor="o">Free offer on the table card</label><input className="inp" id="o" name="offer" defaultValue={r.offer} required maxLength={80} placeholder="free dish" /></div>
    <div className="field"><label htmlFor="cs">Table card and guest page style</label>
      <select className="inp" id="cs" name="card_style" defaultValue={r.card_style ?? "free"}>
        <option value="free">Free dish: &ldquo;A {r.offer}, on us&rdquo;</option>
        <option value="premium">Premium: &ldquo;Join our guest list for private offers&rdquo;</option></select>
      <span className="c5">Premium suits upscale places. The offer above becomes a smaller welcome gift.</span></div>
    <div className="field"><label htmlFor="w">Restaurant WhatsApp number</label><input className="inp" id="w" name="whatsapp" inputMode="numeric" defaultValue={r.whatsapp ?? ""} placeholder="919876543210" />
      <span className="c5">Guests can save this chat after claiming. Digits only, with 91 in front.</span></div>
    <div className="field"><label htmlFor="t">Number of tables</label><input className="inp" id="t" name="tables" type="number" min={1} max={200} defaultValue={r.tables} /></div>
    <div className="field"><label htmlFor="p">Colours on the guest page</label>
      <select className="inp" id="p" name="palette" defaultValue={r.palette}>{PALETTES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}</select>
      <span className="c5">Your own dashboard colours are set with the round button at the bottom of the screen.</span></div>
    <Msg s={s} /><button className="btn pri" disabled={pending}>{pending ? "Saving" : "Save settings"}</button>
  </form>);
}
export function InviteForm({ slug }: { slug: string }) {
  const [s, act, pending] = useActionState<S, FormData>(invite.bind(null, slug) as (p: S, f: FormData) => Promise<S>, null);
  return (<form action={act} className="stackform" style={{ marginTop: 12 }}>
    <div className="field"><label htmlFor="ie">Email</label><input className="inp" id="ie" name="email" type="email" required placeholder="manager@kebabkothi.in" /></div>
    <div className="field"><label htmlFor="ir">Role</label><select className="inp" id="ir" name="role" defaultValue="staff"><option value="staff">Staff: check codes, send offers</option><option value="owner">Owner: everything, including settings</option></select></div>
    <Msg s={s} /><button className="btn pri" disabled={pending}>{pending ? "Inviting" : "Send invite"}</button>
    <p className="c5">They go to the login page and enter this email. No email is sent by the invite itself.</p>
  </form>);
}
export function MemberRow({ slug, m, me }: { slug: string; m: { user_id: string; role: string; email: string | null }; me: boolean }) {
  const [pending, start] = useTransition();
  return (<div className="qitem"><div className="sp"><div className="t3 b6">{m.email ?? "Member"}{me ? " (you)" : ""}</div><div className="c5">{m.role === "owner" ? "Owner" : "Staff"}</div></div>
    {!me && <button className="btn ghost sm" disabled={pending} onClick={() => start(() => removeMember(slug, m.user_id))}>Remove</button>}</div>);
}
export function InviteRow({ slug, i }: { slug: string; i: { id: string; email: string; role: string } }) {
  const [pending, start] = useTransition();
  return (<div className="qitem"><div className="sp"><div className="t3 b6">{i.email}</div><div className="c5">Invited as {i.role}, not logged in yet</div></div>
    <button className="btn ghost sm" disabled={pending} onClick={() => start(() => cancelInvite(slug, i.id))}>Cancel</button></div>);
}

export function SlowHours({ slug, initial }: { slug: string; initial: Slot[] }) {
  const [on, setOn] = useState<Set<string>>(new Set(initial.map((x) => `${x.d}:${x.p}`)));
  const [s, setS] = useState<S>(null); const [pending, start] = useTransition();
  const flip = (k: string) => { setS(null); setOn((o) => { const n = new Set(o); if (n.has(k)) n.delete(k); else n.add(k); return n; }); };
  return (<div style={{ marginTop: 12 }}>
    <p className="c2">Tick the times your dining room is usually quiet. On those days your dashboard reminds you to send an offer.</p>
    <div className="scroll" style={{ marginTop: 12 }}><table className="slots"><thead><tr><th></th>{PARTS.map((p) => <th key={p.id}><div>{p.label}</div><div className="c5">{p.range}</div></th>)}</tr></thead>
      <tbody>{DAYS.map((d, di) => (<tr key={d}><th scope="row">{d.slice(0, 3)}</th>{PARTS.map((p) => { const k = `${di}:${p.id}`; return (
        <td key={k}><button type="button" className={`slot ${on.has(k) ? "on" : ""}`} aria-pressed={on.has(k)} aria-label={`${d} ${p.label}`} onClick={() => flip(k)}>{on.has(k) ? "Slow" : ""}</button></td>); })}</tr>))}</tbody></table></div>
    <div style={{ marginTop: 12 }}><Msg s={s} /></div>
    <button className="btn pri" style={{ marginTop: 8 }} disabled={pending} onClick={() => start(async () => {
      setS(await saveSlowSlots(slug, [...on].map((k) => { const [d, p] = k.split(":"); return { d: Number(d), p }; })));
    })}>{pending ? "Saving" : "Save slow hours"}</button>
  </div>);
}
