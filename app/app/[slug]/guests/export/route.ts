import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

const cell = (v: unknown) => { const s = String(v ?? ""); const safe = /^[=+\-@]/.test(s) ? "'" + s : s; return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe; };
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new NextResponse("Log in first.", { status: 401 });
  const { data: r } = await sb.from("restaurants").select("id,slug").eq("slug", slug).maybeSingle();
  if (!r) return new NextResponse("Not found.", { status: 404 });
  const rows: string[] = ["name,whatsapp,table,joined,birthday,code,used,opted_out"];
  for (let from = 0; ; from += 1000) {
    const { data } = await sb.from("guests").select("name,phone,table_no,created_at,birthday_day,birthday_month,code,redeemed_at,opted_out_at").eq("restaurant_id", r.id).order("created_at").range(from, from + 999);
    if (!data?.length) break;
    data.forEach((g) => rows.push([g.name, "+91" + g.phone, g.table_no, g.created_at.slice(0, 10), g.birthday_month ? `${g.birthday_day ?? ""}/${g.birthday_month}` : "", g.code, g.redeemed_at ? "yes" : "no", g.opted_out_at ? "yes" : "no"].map(cell).join(",")));
    if (data.length < 1000) break;
  }
  return new NextResponse(rows.join("\n"), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${r.slug}-guests.csv"`, "cache-control": "no-store" } });
}
