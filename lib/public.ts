import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { isPalette } from "./palettes";

export type PublicRestaurant = { name: string; area: string | null; offer: string; whatsapp: string | null; palette: string; tables: number; code_prefix: string; card_style: "free" | "premium" };
export const getPublicRestaurant = cache(async (slug: string): Promise<PublicRestaurant | null> => {
  if (!/^[a-z0-9-]{3,40}$/.test(slug)) return null;
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  const { data } = await sb.rpc("public_restaurant", { p_slug: slug });
  const r = Array.isArray(data) ? data[0] : null;
  if (!r) return null;
  return { ...r, palette: isPalette(r.palette) ? r.palette : "sand", card_style: r.card_style === "premium" ? "premium" : "free" };
});
