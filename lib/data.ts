import "server-only";
import { redirect, notFound } from "next/navigation";
import { supabaseServer } from "./supabase/server";

export type Restaurant = {
  id: string; slug: string; name: string; area: string | null; offer: string; code_prefix: string;
  whatsapp: string | null; palette: string; tables: number;
  slow_slots: unknown; card_style: "free" | "premium"; offer_type: string;
};

export async function requireUser() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  return { sb, user };
}

export async function requireRestaurant(slug: string) {
  const { sb, user } = await requireUser();
  const { data: r } = await sb.from("restaurants").select("id,slug,name,area,offer,code_prefix,whatsapp,palette,tables,slow_slots,card_style,offer_type").eq("slug", slug).maybeSingle();
  if (!r) notFound();
  const { data: m } = await sb.from("members").select("role").eq("restaurant_id", r.id).eq("user_id", user.id).maybeSingle();
  const { data: adm } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  const role: "owner" | "staff" = m?.role === "owner" || adm ? "owner" : "staff";
  return { sb, user, r: r as Restaurant, role, isAdmin: !!adm };
}
