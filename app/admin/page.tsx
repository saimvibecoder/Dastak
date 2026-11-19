import Link from "next/link";
import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { requireUser } from "@/lib/data";
import { fmtDate } from "@/lib/util";
import CreateForm from "./CreateForm";
import PasswordForm from "./PasswordForm";
import InstallApp from "@/components/InstallApp";

export const metadata = { title: "Admin", robots: { index: false } };
type Row = { slug: string; name: string; area: string | null; created_at: string; guests: number; week: number; redeemed: number; last_guest: string | null; owners: string | null; invited: string | null };

export default async function Admin() {
  const { sb, user } = await requireUser();
  const { data: adm } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!adm) redirect("/app");
  const { data } = await sb.rpc("admin_overview");
  const rs = (data ?? []) as Row[];
  const sum = (k: "guests" | "week" | "redeemed") => rs.reduce((a, r) => a + (r[k] || 0), 0);
  const live = rs.filter((r) => r.owners).length;
  const kpis: [string, string, string][] = [
    ["Restaurants", String(rs.length), `${live} owner${live === 1 ? "" : "s"} logged in`],
    ["Guests captured", sum("guests").toLocaleString("en-IN"), "across all restaurants"],
    ["New this week", sum("week").toLocaleString("en-IN"), "last 7 days"],
    ["Codes used", sum("redeemed").toLocaleString("en-IN"), "free dishes served"],
  ];
  return (<><Nav current="app" signedIn /><main id="main" className="wrap app">
    <div className="apphead"><div><div className="c2">Admin · {user.email}</div><h1>Overview</h1></div>
      <div className="row"><InstallApp label="Install Dastak Admin" /><form action="/auth/signout" method="post"><button className="btn ghost sm">Log out</button></form></div></div>

    <div className="grid g4">{kpis.map(([l, n, d]) => <div className="card kpi" style={{ padding: 16 }} key={l}><div className="c5">{l}</div><div className="n mono">{n}</div><div className="d">{d}</div></div>)}</div>

    <div className="card" style={{ marginTop: 16 }}>
      <div className="row"><span className="t3">Onboarded restaurants</span><span className="sp"></span><a className="btn ghost sm" href="#add">Add a restaurant</a></div>
      {rs.length ? <div className="scroll" style={{ marginTop: 8 }}><table className="stack"><thead><tr><th>Restaurant</th><th>Owner</th><th>Guests</th><th>This week</th><th>Codes used</th><th>Last guest</th><th>Added</th><th></th></tr></thead><tbody>
        {rs.map((r) => (<tr key={r.slug}>
          <td><b className="t3">{r.name}</b><div className="c5">{r.area ? `${r.area} · ` : ""}/{r.slug}</div></td>
          <td>{r.owners ? <span className="chip ok">{r.owners}</span> : r.invited ? <span className="chip wn">Invited: {r.invited}</span> : <span className="chip">No owner yet</span>}</td>
          <td className="mono">{r.guests}</td><td className="mono">{r.week}</td><td className="mono">{r.redeemed}</td>
          <td style={{ whiteSpace: "nowrap" }}>{r.last_guest ? fmtDate(r.last_guest) : "None yet"}</td>
          <td style={{ whiteSpace: "nowrap" }}>{fmtDate(r.created_at)}</td>
          <td><Link className="btn ghost sm" href={`/app/${r.slug}`}>Open</Link></td></tr>))}
      </tbody></table></div>
      : <div className="empty"><p className="t3" style={{ color: "var(--fg)" }}>No restaurants yet</p><p className="c2">Add your first one below after the owner agrees to a pilot.</p></div>}
    </div>

    <div className="grid g2" style={{ marginTop: 16 }}>
      <div className="card" id="add"><span className="t3">Add a restaurant</span><CreateForm /></div>
      <div className="card"><span className="t3">Your admin password</span>
        <p className="c2" style={{ marginTop: 4 }}>Used at your private admin login page.</p><PasswordForm /></div>
    </div>
  </main></>);
}
