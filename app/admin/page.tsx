import Link from "next/link";
import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { requireUser } from "@/lib/data";
import { fmtDate } from "@/lib/util";
import CreateForm from "./CreateForm";
import PasswordForm from "./PasswordForm";
import DeleteRestaurant from "./DeleteRestaurant";
import InstallApp from "@/components/InstallApp";

export const metadata = { title: "Admin", robots: { index: false } };
type Row = { slug: string; name: string; area: string | null; created_at: string; scans: number; guests: number; week: number; redeemed: number; sent: number; returned: number; last_guest: string | null; owners: string | null; invited: string | null };

export default async function Admin() {
  const { sb, user } = await requireUser();
  const { data: adm } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!adm) redirect("/app");
  const { data } = await sb.rpc("admin_overview");
  const rs = (data ?? []) as Row[];
  const sum = (k: "scans" | "guests" | "week" | "redeemed" | "sent" | "returned") => rs.reduce((a, r) => a + (r[k] || 0), 0);
  const live = rs.filter((r) => r.owners).length;
  const pc = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "–");
  const kpis: [string, string, string][] = [
    ["Restaurants", String(rs.length), `${live} owner${live === 1 ? "" : "s"} logged in`],
    ["Scans", sum("scans").toLocaleString("en-IN"), "table card scans"],
    ["Sign-ups", sum("guests").toLocaleString("en-IN"), `${pc(sum("guests"), sum("scans"))} of scans · ${sum("week")} this week`],
    ["Dishes redeemed", sum("redeemed").toLocaleString("en-IN"), `${pc(sum("redeemed"), sum("guests"))} of sign-ups`],
    ["Offers sent", sum("sent").toLocaleString("en-IN"), "WhatsApp messages"],
    ["Came back", sum("returned").toLocaleString("en-IN"), `${pc(sum("returned"), sum("guests"))} of sign-ups`],
  ];
  return (<><Nav current="app" signedIn /><main id="main" className="wrap app">
    <div className="apphead"><div><div className="c2">Admin · {user.email}</div><h1>Overview</h1></div>
      <div className="row"><InstallApp label="Install Dastak Admin" /><form action="/auth/signout" method="post"><button className="btn ghost sm">Log out</button></form></div></div>

    <div className="grid g3">{kpis.map(([l, n, d]) => <div className="card kpi" style={{ padding: 16 }} key={l}><div className="c5">{l}</div><div className="n mono">{n}</div><div className="d">{d}</div></div>)}</div>

    <div className="card" style={{ marginTop: 16 }}>
      <div className="row"><span className="t3">Onboarded restaurants</span><span className="sp"></span><a className="btn ghost sm" href="#add">Add a restaurant</a></div>
      {rs.length ? <div className="scroll" style={{ marginTop: 8 }}><table className="stack"><thead><tr><th>Restaurant</th><th>Owner</th><th>Scans</th><th>Sign-ups</th><th>Redeemed</th><th>Offers sent</th><th>Came back</th><th>Last guest</th><th></th></tr></thead><tbody>
        {rs.map((r) => (<tr key={r.slug}>
          <td><b className="t3">{r.name}</b><div className="c5">{r.area ? `${r.area} · ` : ""}/{r.slug}</div></td>
          <td>{r.owners ? <span className="chip ok">{r.owners}</span> : r.invited ? <span className="chip wn">Invited: {r.invited}</span> : <span className="chip">No owner yet</span>}</td>
          <td className="mono">{r.scans ?? 0}</td><td className="mono">{r.guests}<div className="c5">{pc(r.guests, r.scans ?? 0)}</div></td>
          <td className="mono">{r.redeemed}<div className="c5">{pc(r.redeemed, r.guests)}</div></td><td className="mono">{r.sent ?? 0}</td>
          <td className="mono">{r.returned ?? 0}<div className="c5">{pc(r.returned ?? 0, r.guests)}</div></td>
          <td style={{ whiteSpace: "nowrap" }}>{r.last_guest ? fmtDate(r.last_guest) : "None yet"}<div className="c5">added {fmtDate(r.created_at)}</div></td>
          <td><div className="row" style={{ gap: 8, flexWrap: "nowrap", alignItems: "flex-start" }}><Link className="btn ghost sm" href={`/app/${r.slug}`}>Open</Link><DeleteRestaurant slug={r.slug} name={r.name} /></div></td></tr>))}
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
