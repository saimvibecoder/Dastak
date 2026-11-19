import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { supabaseService } from "@/lib/supabase/admin";
import { ipHash, sameOrigin } from "@/lib/guard";

const Body = z.object({ slug: z.string().regex(/^[a-z0-9-]{3,40}$/), phone: z.string().regex(/^[6-9]\d{9}$/) }).strict();
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter the 10 digit number you joined with." }, { status: 400 });
  const { data, error } = await supabaseService().rpc("opt_out", { p_slug: parsed.data.slug, p_phone: parsed.data.phone, p_ip: ipHash(req) });
  if (error) return NextResponse.json({ error: "We couldn't save that just now. Try again in a moment." }, { status: 500 });
  if (data?.error) return NextResponse.json({ error: "Too many tries. Wait a few minutes." }, { status: 429 });
  return NextResponse.json({ ok: true });
}
