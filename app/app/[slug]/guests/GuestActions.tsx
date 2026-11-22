"use client";
import { useState, useTransition } from "react";
import { addVisit, deleteGuest, setOptOut, setRedeemed } from "../actions";
import { wa, firstName } from "@/lib/util";

export default function GuestActions({ slug, g, owner }: { slug: string; g: { id: string; name: string; phone: string | null; used: boolean; out: boolean }; owner: boolean }) {
  const [pending, start] = useTransition(); const [confirm, setConfirm] = useState(false);
  const run = (fn: () => Promise<unknown>) => start(async () => { await fn(); });
  return (<div className="row" style={{ flexWrap: "wrap", gap: 8, opacity: pending ? .6 : 1 }}>
    {!g.out && <a className="btn wa sm" target="_blank" rel="noopener" href={wa("91" + g.phone, `Hi ${firstName(g.name)}, `)}>Chat</a>}
    <button className="btn ghost sm" disabled={pending} onClick={() => run(() => addVisit(slug, g.id))}>+ Visit</button>
    <button className="btn ghost sm" disabled={pending} onClick={() => run(() => setRedeemed(slug, g.id, !g.used))}>{g.used ? "Undo used" : "Mark used"}</button>
    {!g.out && <button className="btn ghost sm" disabled={pending} onClick={() => { if (window.confirm(`Take ${firstName(g.name)} off the list? Their name and number will be removed. They can join again by scanning a table QR.`)) run(() => setOptOut(slug, g.id, true)); }}>Opt out</button>}
    {owner && (confirm
      ? <button className="btn ghost sm" style={{ color: "#b2304a" }} disabled={pending} onClick={() => run(() => deleteGuest(slug, g.id))}>Confirm delete</button>
      : <button className="btn ghost sm" onClick={() => setConfirm(true)} aria-label={`Delete ${g.name}`}>Delete</button>)}
  </div>);
}
