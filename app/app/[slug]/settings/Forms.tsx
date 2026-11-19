"use client";
import { useActionState, useTransition } from "react";
import { saveSettings, invite, cancelInvite, removeMember } from "../actions";
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
