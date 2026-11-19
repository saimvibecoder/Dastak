import { redirect } from "next/navigation";
import { requireRestaurant } from "@/lib/data";
import { SettingsForm, InviteForm, MemberRow, InviteRow } from "./Forms";

export const metadata = { title: "Settings" };
export default async function Settings({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const { sb, r, role, user } = await requireRestaurant(slug);
  if (role !== "owner") redirect(`/app/${slug}`);
  const [{ data: ms }, { data: inv }] = await Promise.all([
    sb.from("members").select("user_id,role,email").eq("restaurant_id", r.id).order("created_at"),
    sb.from("invites").select("id,email,role").eq("restaurant_id", r.id).order("created_at"),
  ]);
  return (<div className="grid g2">
    <div className="card"><span className="t3">Restaurant</span><SettingsForm slug={slug} r={r} /></div>
    <div className="card"><span className="t3">People with access</span>
      <div style={{ marginTop: 8 }}>{(ms ?? []).map((m) => <MemberRow key={m.user_id} slug={slug} m={m} me={m.user_id === user.id} />)}
        {(inv ?? []).map((i) => <InviteRow key={i.id} slug={slug} i={i} />)}</div>
      <span className="t3" style={{ display: "block", marginTop: 24 }}>Invite someone</span><InviteForm slug={slug} /></div>
  </div>);
}
