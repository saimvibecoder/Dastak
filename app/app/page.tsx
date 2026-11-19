import Link from "next/link";
import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { requireUser } from "@/lib/data";

export const metadata = { title: "Your restaurants" };
export default async function AppHome() {
  const { sb, user } = await requireUser();
  await sb.rpc("accept_invites");
  const [{ data: rs }, { data: adm }] = await Promise.all([
    sb.from("restaurants").select("slug,name,area").order("name"),
    sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle(),
  ]);
  if (adm) redirect("/admin");
  if (rs?.length === 1) redirect(`/app/${rs[0].slug}`);
  return (<><Nav current="app" signedIn /><main id="main" className="wrap app">
    <div className="apphead"><div><div className="c2">{user.email}</div><h1>Your restaurants</h1></div>
      <div className="row">{adm && <Link className="btn pri sm" href="/admin">Add a restaurant</Link>}
        <form action="/auth/signout" method="post"><button className="btn ghost sm">Log out</button></form></div></div>
    {rs?.length ? <div className="grid g3">{rs.map((r) => (
      <Link key={r.slug} className="card plain" href={`/app/${r.slug}`}><h3>{r.name}</h3><p>{r.area || "Open dashboard"}</p></Link>))}</div>
    : <div className="card empty"><p className="t3" style={{ color: "var(--fg)" }}>No restaurant is linked to {user.email} yet</p>
        <p className="c2">Ask the person who set up Dastak to invite this exact email address, then log in again.</p></div>}
  </main></>);
}
