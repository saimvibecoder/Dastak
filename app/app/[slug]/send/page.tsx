import { requireRestaurant } from "@/lib/data";
import { fmtDate } from "@/lib/util";
import { origin } from "@/lib/host";
import Composer, { type G } from "./Composer";

export const metadata = { title: "Send offer" };
export default async function Send({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ slot?: string; tpl?: string }> }) {
  const { slug } = await params; const { slot, tpl } = await searchParams; const t = Number(tpl);
  const { sb, r } = await requireRestaurant(slug); const site = await origin();
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const [{ data: gs }, { data: recent }, { data: camps }] = await Promise.all([
    sb.from("guests").select("id,name,phone,code,birthday_month,created_at").eq("restaurant_id", r.id).is("opted_out_at", null).order("created_at", { ascending: false }).limit(5000),
    sb.from("visits").select("guest_id").eq("restaurant_id", r.id).gte("at", since).limit(20000),
    sb.from("campaigns").select("id,name,audience,sent_count,created_at").eq("restaurant_id", r.id).order("created_at", { ascending: false }).limit(10),
  ]);
  const active = new Set((recent ?? []).map((v) => v.guest_id));
  const guests: G[] = (gs ?? []).map((g) => ({ id: g.id, name: g.name, phone: g.phone, code: g.code, bm: g.birthday_month, joined: Date.parse(g.created_at), recent: active.has(g.id) }));
  return <Composer slug={slug} r={{ name: r.name, offer: r.offer }} stopUrl={`${site}/r/${slug}/stop`} slot={slot?.slice(0, 60) || ""} startTpl={Number.isInteger(t) && t >= 0 && t <= 4 ? t : 0} guests={guests}
    past={(camps ?? []).map((c) => ({ id: c.id, name: c.name, audience: c.audience, sent: c.sent_count, at: fmtDate(c.created_at) }))} />;
}
