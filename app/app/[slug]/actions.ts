"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRestaurant } from "@/lib/data";
import { isPalette } from "@/lib/palettes";
import { ensureAccount } from "@/lib/accounts";
import { parseSlots } from "@/lib/slots";

const uuid = z.string().uuid();
const done = (slug: string) => { revalidatePath(`/app/${slug}`, "layout"); };

export async function setRedeemed(slug: string, guestId: string, used: boolean) {
  const { sb, r } = await requireRestaurant(slug);
  await sb.from("guests").update({ redeemed_at: used ? new Date().toISOString() : null }).eq("id", uuid.parse(guestId)).eq("restaurant_id", r.id);
  done(slug);
}
export async function addVisit(slug: string, guestId: string) {
  const { sb, r } = await requireRestaurant(slug);
  await sb.from("visits").insert({ restaurant_id: r.id, guest_id: uuid.parse(guestId) });
  done(slug);
}
export async function setOptOut(slug: string, guestId: string, out: boolean) {
  const { sb, r } = await requireRestaurant(slug);
  await sb.from("guests").update({ opted_out_at: out ? new Date().toISOString() : null }).eq("id", uuid.parse(guestId)).eq("restaurant_id", r.id);
  done(slug);
}
export async function deleteGuest(slug: string, guestId: string) {
  const { sb, r, role } = await requireRestaurant(slug);
  if (role !== "owner") return { error: "Only owners can remove guests." };
  await sb.from("guests").delete().eq("id", uuid.parse(guestId)).eq("restaurant_id", r.id);
  done(slug); return { ok: true };
}
export async function findCode(slug: string, code: string) {
  const { sb, r } = await requireRestaurant(slug);
  // Forgiving input: "dd1563", "dd 1563", "DD-1563", just "1563", or the guest's 10 digit number.
  const raw = code.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^91(?=[6-9]\d{9}$)/, "");
  const cols = "id,name,phone,table_no,created_at,redeemed_at,code";
  let q;
  if (/^[6-9]\d{9}$/.test(raw)) q = sb.from("guests").select(cols).eq("restaurant_id", r.id).eq("phone", raw);
  else {
    const m = /^([A-Z]{2,4})?(\d{4})$/.exec(raw);
    if (!m) return { error: "Type the 4 numbers from the guest's code, like 4821, or their 10 digit mobile number." };
    q = sb.from("guests").select(cols).eq("restaurant_id", r.id).eq("code", `${m[1] ?? r.code_prefix}-${m[2]}`);
  }
  const { data } = await q.maybeSingle();
  if (!data) return { error: "No guest found with that code or number. Check it again." };
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const [{ data: camp }, { data: back }] = await Promise.all([
    sb.from("campaigns").select("id,name,created_at").eq("restaurant_id", r.id).gte("created_at", since).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    sb.from("visits").select("at").eq("restaurant_id", r.id).eq("guest_id", data.id).eq("kind", "return").order("at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  return { guest: data, campaign: camp ?? null, lastReturn: back?.at ?? null };
}
export async function logReturn(slug: string, guestId: string, campaignId: string | null) {
  const { sb, r } = await requireRestaurant(slug);
  const { error } = await sb.from("visits").insert({ restaurant_id: r.id, guest_id: uuid.parse(guestId), kind: "return", campaign_id: campaignId ? uuid.parse(campaignId) : null });
  done(slug); return error ? { error: "Couldn't save the visit. Try again." } : { ok: true };
}
const Camp = z.object({ name: z.string().min(1).max(60), audience: z.string().min(1).max(60), message: z.string().min(1).max(1000) });
/** Called the first time an offer goes out, so every send is counted without a separate save step. */
export async function startCampaign(slug: string, input: { name: string; audience: string; message: string }) {
  const { sb, r, user } = await requireRestaurant(slug);
  const v = Camp.parse(input);
  const { data, error } = await sb.from("campaigns").insert({ restaurant_id: r.id, name: v.name, audience: v.audience, message: v.message, sent_count: 0, created_by: user.id }).select("id").single();
  return error || !data ? { error: "Couldn't start the offer. Try again." } : { id: data.id as string };
}
export async function countSent(slug: string, id: string, sent: number) {
  const { sb, r } = await requireRestaurant(slug);
  const n = z.number().int().min(0).max(100000).parse(sent);
  await sb.from("campaigns").update({ sent_count: n }).eq("id", uuid.parse(id)).eq("restaurant_id", r.id).lt("sent_count", n);
  done(slug);
}

const Settings = z.object({
  name: z.string().trim().min(2).max(60), area: z.string().trim().max(60), offer: z.string().trim().min(3).max(80),
  whatsapp: z.string().trim().regex(/^(\d{10,15})?$/), tables: z.coerce.number().int().min(1).max(200), palette: z.string(),
  card_style: z.enum(["free", "premium"]),
});
export async function saveSettings(slug: string, _: unknown, fd: FormData) {
  const { sb, r, role } = await requireRestaurant(slug);
  if (role !== "owner") return { error: "Only owners can change settings." };
  const raw = Object.fromEntries(fd); raw.whatsapp = String(raw.whatsapp || "").replace(/\D/g, "");
  if (/^\d{10}$/.test(String(raw.whatsapp))) raw.whatsapp = "91" + raw.whatsapp;
  const p = Settings.safeParse(raw);
  if (!p.success || !isPalette(p.data.palette)) return { error: "Check the fields: name, offer, a WhatsApp number with country code, and 1 to 200 tables." };
  const { error } = await sb.from("restaurants").update({ ...p.data, area: p.data.area || null, whatsapp: p.data.whatsapp || null }).eq("id", r.id);
  done(slug); return error ? { error: "Couldn't save. Try again." } : { ok: "Settings saved." };
}
export async function saveSlowSlots(slug: string, slots: { d: number; p: string }[]) {
  const { sb, r, role } = await requireRestaurant(slug);
  if (role !== "owner") return { error: "Only owners can change slow hours." };
  const clean = parseSlots(slots);
  const { error } = await sb.from("restaurants").update({ slow_slots: clean }).eq("id", r.id);
  done(slug); return error ? { error: "Couldn't save. Try again." } : { ok: `Saved ${clean.length} slow slot${clean.length === 1 ? "" : "s"}.` };
}
export async function invite(slug: string, _: unknown, fd: FormData) {
  const { sb, r, role } = await requireRestaurant(slug);
  if (role !== "owner") return { error: "Only owners can invite people." };
  const email = String(fd.get("email") || "").trim().toLowerCase(); const rl = fd.get("role") === "owner" ? "owner" : "staff";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Enter a full email address." };
  const { error } = await sb.from("invites").upsert({ restaurant_id: r.id, email, role: rl }, { onConflict: "restaurant_id,email" });
  if (error) return { error: "Couldn't add the invite. Try again." };
  try { await ensureAccount(email); } catch { return { error: "Invite saved, but their login couldn't be set up. Try again." }; }
  done(slug); return { ok: `Invited ${email}. They log in at https://dastak.food/login with this email.` };
}
export async function cancelInvite(slug: string, id: string) {
  const { sb, r } = await requireRestaurant(slug);
  await sb.from("invites").delete().eq("id", uuid.parse(id)).eq("restaurant_id", r.id); done(slug);
}
export async function removeMember(slug: string, userId: string) {
  const { sb, r, role } = await requireRestaurant(slug);
  if (role !== "owner") return;
  await sb.from("members").delete().eq("restaurant_id", r.id).eq("user_id", uuid.parse(userId)); done(slug);
}
