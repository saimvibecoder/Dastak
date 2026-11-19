import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { supabaseService } from "@/lib/supabase/admin";
import { ipHash, sameOrigin } from "@/lib/guard";

const Body = z.object({
  slug: z.string().regex(/^[a-z0-9-]{3,40}$/),
  table: z.coerce.number().int().min(1).max(200).nullable().optional(),
  name: z.string().trim().min(2).max(60),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  bday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  consent: z.literal(true),
  website: z.string().max(0).optional(), // honeypot: bots fill it, people never see it
}).strict();
const MSG: Record<string, string> = {
  exists: "This number is already on the guest list here, so its welcome offer has been claimed. Your server can look you up by your number.",
  slow_down: "Too many tries from this connection. Wait a few minutes and try again.",
  not_found: "This restaurant isn't on Dastak any more.",
  busy: "Something went wrong creating your code. Try again.",
};

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check your name, number and the consent box, then try again." }, { status: 400 });
  const b = parsed.data;
  const d = b.bday ? new Date(b.bday + "T00:00:00") : null;
  const { data, error } = await supabaseService().rpc("claim_offer", {
    p_slug: b.slug, p_table: b.table ?? null, p_name: b.name, p_phone: b.phone,
    p_bday_d: d ? d.getDate() : null, p_bday_m: d ? d.getMonth() + 1 : null, p_ip: ipHash(req),
  });
  if (error) return NextResponse.json({ error: "We couldn't save that just now. Try again in a moment." }, { status: 500 });
  if (data?.error) return NextResponse.json({ error: MSG[data.error] ?? MSG.busy }, { status: data.error === "slow_down" ? 429 : 409 });
  return NextResponse.json({ code: data.code, whatsapp: data.whatsapp, name: data.name, offer: data.offer });
}
