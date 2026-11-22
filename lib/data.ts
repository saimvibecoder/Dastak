import "server-only";
import { redirect, notFound } from "next/navigation";
import { cache } from "react";
import { supabaseServer } from "./supabase/server";

export type Restaurant = {
  id: string; slug: string; name: string; area: string | null; offer: string; code_prefix: string;
  whatsapp: string | null; palette: string; tables: number;
  slow_slots: unknown; card_style: "free" | "premium"; offer_type: string;
};

// One verified auth check per request, shared by the layout and the page.
const getAuth = cache(async () => {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  // Worked out from what we already have, to avoid another call to the auth server.
  let aal: { currentLevel: string; nextLevel: string } | null = null;
  if (user) {
    const { data: { session } } = await sb.auth.getSession();
    let current = "aal1";
    try { current = JSON.parse(Buffer.from((session?.access_token ?? "").split(".")[1] ?? "", "base64url").toString()).aal ?? "aal1"; } catch {}
    const hasFactor = (user.factors ?? []).some((f) => f.status === "verified");
    aal = { currentLevel: current, nextLevel: hasFactor ? "aal2" : "aal1" };
  }
  return { sb, user, aal };
});

// Signed in, and past the two-step code if this account has one set up.
export async function requireUser(opts: { allowAal1?: boolean } = {}) {
  const { sb, user, aal } = await getAuth();
  if (!user) redirect("/login");
  if (!opts.allowAal1 && aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") redirect("/verify");
  return { sb, user, twoStep: aal?.nextLevel === "aal2" };
}

// The three lookups run together instead of one after another.
export const requireRestaurant = cache(async (slug: string) => {
  const { sb, user } = await requireUser();
  const [{ data: r }, { data: ms }, { data: adm }] = await Promise.all([
    sb.from("restaurants").select("id,slug,name,area,offer,code_prefix,whatsapp,palette,tables,slow_slots,card_style,offer_type").eq("slug", slug).maybeSingle(),
    sb.from("members").select("role,restaurant_id").eq("user_id", user.id),
    sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle(),
  ]);
  if (!r) notFound();
  const m = ms?.find((x) => x.restaurant_id === r.id);
  const role: "owner" | "staff" = m?.role === "owner" || adm ? "owner" : "staff";
  return { sb, user, r: r as Restaurant, role, isAdmin: !!adm };
});
