"use client";
import { useActionState, useState } from "react";
import { createRestaurant } from "./actions";

export default function CreateForm() {
  const [s, act, pending] = useActionState(createRestaurant, null);
  const [name, setName] = useState(""); const [slug, setSlug] = useState(""); const [touched, setTouched] = useState(false);
  const auto = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  return (<form action={act} className="stackform" style={{ marginTop: 16 }}>
    <div className="field"><label htmlFor="cn">Restaurant name</label><input className="inp" id="cn" name="name" required value={name} onChange={(e) => { setName(e.target.value); if (!touched) setSlug(auto(e.target.value)); }} placeholder="Kebab Kothi" /></div>
    <div className="field"><label htmlFor="cs">Web address</label><input className="inp mono" id="cs" name="slug" required value={slug} onChange={(e) => { setTouched(true); setSlug(e.target.value.toLowerCase()); }} placeholder="kebab-kothi" />
      <span className="c5">Guests land on /r/{slug || "kebab-kothi"}/t/12</span></div>
    <div className="field"><label htmlFor="ca">Area</label><input className="inp" id="ca" name="area" placeholder="Aminabad" /></div>
    <div className="field"><label htmlFor="co">Free offer</label><input className="inp" id="co" name="offer" required defaultValue="free dish" placeholder="free dish" /></div>
    <div className="row" style={{ alignItems: "flex-start" }}>
      <div className="field sp"><label htmlFor="cp">Code prefix</label><input className="inp mono" id="cp" name="prefix" required maxLength={4} placeholder="KK" /></div>
      <div className="field sp"><label htmlFor="ct">Tables</label><input className="inp" id="ct" name="tables" type="number" min={1} max={200} defaultValue={12} /></div></div>
    <div className="field"><label htmlFor="ce">Owner&apos;s email</label><input className="inp" id="ce" name="email" type="email" required placeholder="owner@kebabkothi.in" />
      <span className="c5">They become owner the first time they log in with this email.</span></div>
    {s?.error && <p className="notice err" role="alert">{s.error}</p>}
    <button className="btn pri" disabled={pending}>{pending ? "Creating" : "Create restaurant"}</button>
  </form>);
}
