"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/data";
import { ensureAccount } from "@/lib/accounts";

const In = z.object({
  name: z.string().trim().min(2).max(60), area: z.string().trim().max(60), offer: z.string().trim().min(3).max(80),
  slug: z.string().regex(/^[a-z0-9-]{3,40}$/), prefix: z.string().trim().toUpperCase().regex(/^[A-Z]{2,4}$/),
  tables: z.coerce.number().int().min(1).max(200), email: z.string().trim().toLowerCase().email(),
});
export async function createRestaurant(_: unknown, fd: FormData) {
  const { sb } = await requireUser();
  const p = In.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: "Check every field: web address in lowercase letters, numbers and hyphens; code prefix of 2 to 4 letters; a valid owner email." };
  const v = p.data;
  const { error } = await sb.rpc("admin_create_restaurant", { p_slug: v.slug, p_name: v.name, p_area: v.area, p_offer: v.offer, p_prefix: v.prefix, p_tables: v.tables, p_owner_email: v.email });
  if (error) return { error: error.code === "23505" ? `The address /${v.slug} is taken. Pick another.` : "Couldn't create it. Only admins can add restaurants." };
  try { await ensureAccount(v.email); } catch { return { error: "Restaurant created, but the owner's login couldn't be set up. Open it and re-invite the owner in Settings." }; }
  redirect(`/app/${v.slug}`);
}

// Permanently deletes a restaurant and everything in it (guests, visits, campaigns, staff access).
export async function deleteRestaurant(slug: string, typedName: string) {
  const { sb, user } = await requireUser();
  const { data: adm } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!adm) return { error: "Only admins can delete restaurants." };
  const { data: r } = await sb.from("restaurants").select("id,name").eq("slug", slug).maybeSingle();
  if (!r) return { error: "That restaurant no longer exists." };
  if (typedName.trim().toLowerCase() !== r.name.trim().toLowerCase()) return { error: "The name you typed doesn't match." };
  const { error } = await sb.from("restaurants").delete().eq("id", r.id);
  if (error) return { error: "Couldn't delete it. Try again." };
  revalidatePath("/admin");
  return { ok: true };
}
