"use client";
import { useState, useTransition } from "react";
import { deleteRestaurant } from "./actions";

export default function DeleteRestaurant({ slug, name }: { slug: string; name: string }) {
  const [open, setOpen] = useState(false); const [typed, setTyped] = useState(""); const [err, setErr] = useState(""); const [pending, start] = useTransition();
  if (!open) return <button className="btn ghost sm" onClick={() => setOpen(true)} aria-label={`Delete ${name}`}>Delete</button>;
  return (<div className="stackform" style={{ gap: 8, minWidth: 220 }}>
    <span className="c5" style={{ color: "#b2304a" }}>Deletes {name} and all its guests forever. Type the name to confirm.</span>
    <input className="inp" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={name} aria-label="Type the restaurant name to confirm" />
    {err && <span className="err">{err}</span>}
    <div className="row" style={{ gap: 8 }}>
      <button className="btn ghost sm" style={{ color: "#b2304a" }} disabled={pending || typed.trim().toLowerCase() !== name.trim().toLowerCase()}
        onClick={() => start(async () => { const r = await deleteRestaurant(slug, typed); if (r.error) setErr(r.error); })}>{pending ? "Deleting" : "Delete forever"}</button>
      <button className="btn ghost sm" onClick={() => { setOpen(false); setTyped(""); setErr(""); }}>Cancel</button></div>
  </div>);
}
