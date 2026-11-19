import Link from "next/link";
import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { requireUser } from "@/lib/data";
import CreateForm from "./CreateForm";
import PasswordForm from "./PasswordForm";

export const metadata = { title: "Admin" };
export default async function Admin() {
  const { sb, user } = await requireUser();
  const { data: adm } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!adm) redirect("/app");
  const { data: rs } = await sb.from("restaurants").select("slug,name,area,created_at").order("created_at", { ascending: false });
  return (<><Nav current="app" signedIn /><main id="main" className="wrap app">
    <div className="apphead"><div><div className="c2">Admin · {user.email}</div><h1>Restaurants</h1></div><form action="/auth/signout" method="post"><button className="btn ghost sm">Log out</button></form></div>
    <div className="grid g2">
      <div className="card"><span className="t3">Add a restaurant</span><CreateForm /></div>
      <div className="card"><span className="t3">{rs?.length ?? 0} on Dastak</span>{(rs ?? []).map((r) => (
        <div className="qitem" key={r.slug}><div className="sp"><div className="t3 b6">{r.name}</div><div className="c5">/{r.slug}{r.area ? ` · ${r.area}` : ""}</div></div><Link className="btn ghost sm" href={`/app/${r.slug}`}>Open</Link></div>))}</div>
    </div>
    <div className="card" style={{ marginTop: 16, maxWidth: 520 }}><span className="t3">Your admin password</span>
      <p className="c2" style={{ marginTop: 4 }}>Set a password so you can log in without waiting for an email code.</p><PasswordForm /></div>
    </main></>);
}
