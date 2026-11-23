import Link from "next/link";
import { requireRestaurant } from "@/lib/data";
import { fmtDate, phoneFmt, MONTHS } from "@/lib/util";
import GuestActions from "./GuestActions";

export const metadata = { title: "Guests" };
const PER = 50;
const FILTERS = [["all", "All guests"], ["bday", "Birthday this month"], ["unused", "Code not used"], ["out", "Opted out"]] as const;

export default async function Guests({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ q?: string; f?: string; page?: string }> }) {
  const { slug } = await params; const sp = await searchParams;
  const { sb, r, role } = await requireRestaurant(slug);
  const q = (sp.q || "").trim().slice(0, 60), f = FILTERS.some(([k]) => k === sp.f) ? sp.f! : "all", page = Math.max(1, Number(sp.page) || 1);
  let query = sb.from("guests").select("id,name,phone,table_no,created_at,birthday_day,birthday_month,code,redeemed_at,opted_out_at", { count: "exact" }).eq("restaurant_id", r.id);
  if (q) { const digits = q.replace(/\D/g, ""); const safe = q.replace(/[%,()*]/g, "");
    query = query.or([`name.ilike.%${safe}%`, `code.ilike.%${safe}%`, digits.length >= 3 ? `phone.like.%${digits}%` : ""].filter(Boolean).join(",")); }
  if (f === "bday") query = query.eq("birthday_month", Number(new Date().toLocaleString("en-US", { month: "numeric", timeZone: "Asia/Kolkata" })));
  if (f === "unused") query = query.is("redeemed_at", null);
  if (f === "out") query = query.not("opted_out_at", "is", null);
  const { data: rows, count } = await query.order("created_at", { ascending: false }).range((page - 1) * PER, page * PER - 1);
  const ids = (rows ?? []).map((g) => g.id);
  const { data: vs } = ids.length ? await sb.from("visits").select("guest_id").in("guest_id", ids) : { data: [] };
  const visits = new Map<string, number>(); (vs ?? []).forEach((v) => visits.set(v.guest_id, (visits.get(v.guest_id) || 0) + 1));
  const pages = Math.max(1, Math.ceil((count || 0) / PER));
  const link = (p: number) => `?${new URLSearchParams({ ...(q && { q }), ...(f !== "all" && { f }), page: String(p) })}`;

  return (<div className="card">
    <form className="row" method="get">
      <input className="inp" name="q" defaultValue={q} placeholder="Search name, number or code" style={{ maxWidth: 320 }} aria-label="Search guests" />
      <select className="inp" name="f" defaultValue={f} style={{ width: "auto" }} aria-label="Filter">{FILTERS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
      <button className="btn ghost sm">Search</button><span className="sp"></span>
      {role === "owner" && <a className="btn ghost sm" href={`/app/${slug}/guests/export`}>Download CSV</a>}
    </form>
    <p className="c5" style={{ marginTop: 12 }}>{count ?? 0} guests{pages > 1 ? ` · page ${page} of ${pages}` : ""}</p>
    {rows?.length ? <div className="scroll" style={{ marginTop: 8 }}><table className="stack"><thead><tr><th>Guest</th><th>WhatsApp</th><th>Table</th><th>Joined</th><th>Visits</th><th>Birthday</th><th>Code</th><th></th></tr></thead><tbody>
      {rows.map((g) => (<tr key={g.id}>
        <td><b className="t3">{g.name}</b>{g.opted_out_at && <> <span className="chip">Opted out</span></>}</td>
        <td className="mono" style={{ whiteSpace: "nowrap" }}>{phoneFmt(g.phone)}</td><td>{g.table_no ?? ""}</td>
        <td style={{ whiteSpace: "nowrap" }}>{fmtDate(g.created_at)}</td><td>{visits.get(g.id) || 0}</td>
        <td>{g.birthday_month ? `${g.birthday_day ?? ""} ${MONTHS[g.birthday_month - 1]}` : ""}</td>
        <td>{g.redeemed_at ? <span className="chip ok">Used</span> : <span className="chip ac mono">{g.code}</span>}</td>
        <td><GuestActions slug={slug} g={{ id: g.id, name: g.name, phone: g.phone, used: !!g.redeemed_at, out: !!g.opted_out_at }} owner={role === "owner"} /></td>
      </tr>))}</tbody></table></div>
    : <div className="empty"><p className="t3" style={{ color: "var(--fg)" }}>{q || f !== "all" ? "No guests match" : "No guests yet"}</p>
        <p className="c2">{q || f !== "all" ? "Try another search, or switch the filter back to all guests." : "Guests appear here as soon as they claim the offer from a table QR."}</p></div>}
    {pages > 1 && <div className="row" style={{ marginTop: 16, justifyContent: "center" }}>
      {page > 1 && <Link className="btn ghost sm" href={link(page - 1)}>Previous</Link>}{page < pages && <Link className="btn ghost sm" href={link(page + 1)}>Next</Link>}</div>}
  </div>);
}
