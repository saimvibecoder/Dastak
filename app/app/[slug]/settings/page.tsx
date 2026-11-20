import { redirect } from "next/navigation";
import { requireRestaurant } from "@/lib/data";
import { SettingsForm, InviteForm, MemberRow, InviteRow, SlowHours, DataCard } from "./Forms";
import { parseSlots } from "@/lib/slots";

export const metadata = { title: "Settings" };
export default async function Settings({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const { sb, r, role, user } = await requireRestaurant(slug);
  if (role !== "owner") redirect(`/app/${slug}`);
  const [{ data: ms }, { data: inv }] = await Promise.all([
    sb.from("members").select("user_id,role,email").eq("restaurant_id", r.id).order("created_at"),
    sb.from("invites").select("id,email,role").eq("restaurant_id", r.id).order("created_at"),
  ]);
  const { data: del } = await sb.from("restaurants").select("delete_requested_at").eq("id", r.id).maybeSingle();
  return (<><div className="grid g2">
    <div className="card"><span className="t3">Restaurant</span><SettingsForm slug={slug} r={r} /></div>
    <div className="card"><span className="t3">People with access</span>
      <div style={{ marginTop: 8 }}>{(ms ?? []).map((m) => <MemberRow key={m.user_id} slug={slug} m={m} me={m.user_id === user.id} />)}
        {(inv ?? []).map((i) => <InviteRow key={i.id} slug={slug} i={i} />)}</div>
      <span className="t3" style={{ display: "block", marginTop: 24 }}>Invite someone</span><InviteForm slug={slug} /></div>
  </div>
  <div className="card" style={{ marginTop: 16 }} id="slow"><span className="t3">Slow hours</span><SlowHours slug={slug} initial={parseSlots(r.slow_slots)} /></div>
  <div className="card" style={{ marginTop: 16 }} id="data"><span className="t3">Your data</span><DataCard slug={slug} requested={del?.delete_requested_at ?? null} /></div></>);
}
