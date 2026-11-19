"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRestaurant } from "@/lib/data";
import { isPalette } from "@/lib/palettes";
import { ensureAccount } from "@/lib/accounts";

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
  const c = code.trim().toUpperCase();
  if (!/^[A-Z]{2,4}-\d{4}$/.test(c)) return { error: `Codes look like ${r.code_prefix}-4821. Check the letters and numbers.` };
  const { data } = await sb.from("guests").select("id,name,table_no,created_at,redeemed_at,code").eq("restaurant_id", r.id).eq("code", c).maybeSingle();
  if (!data) return { error: `No guest has code ${c}. Check the letters and numbers again.` };
  return { guest: data };
}
export async function saveCampaign(slug: string, input: { name: string; audience: string; message: string; sent: number }) {
  const { sb, r } = await requireRestaurant(slug);
  const v = z.object({ name: z.string().min(1).max(60), audience: z.string().min(1).max(60), message: z.string().min(1).max(1000), sent: z.number().int().min(1).max(100000) }).parse(input);
  const { error } = await sb.from("campaigns").insert({ restaurant_id: r.id, name: v.name, audience: v.audience, message: v.message, sent_count: v.sent });
  done(slug); return error ? { error: "Couldn't save the campaign. Try again." } : { ok: true };
}

const Settings = z.object({
  name: z.string().trim().min(2).max(60), area: z.string().trim().max(60), offer: z.string().trim().min(3).max(80),
  whatsapp: z.string().trim().regex(/^(\d{10,15})?$/), tables: z.coerce.number().int().min(1).max(200), palette: z.string(),
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
export async function invite(slug: string, _: unknown, fd: FormData) {
  const { sb, r, role } = await requireRestaurant(slug);
  if (role !== "owner") return { error: "Only owners can invite people." };
  const email = String(fd.get("email") || "").trim().toLowerCase(); const rl = fd.get("role") === "owner" ? "owner" : "staff";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Enter a full email address." };
  const { error } = await sb.from("invites").upsert({ restaurant_id: r.id, email, role: rl }, { onConflict: "restaurant_id,email" });
  if (error) return { error: "Couldn't add the invite. Try again." };
  try { await ensureAccount(email); } catch { return { error: "Invite saved, but their login couldn't be set up. Try again." }; }
  done(slug); return { ok: `Invited ${email}. They log in at dastak.food/login with this email.` };
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
