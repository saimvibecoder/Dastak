import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const to = new URL("/app", req.url);
  if (code) {
    const sb = await supabaseServer();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) { await sb.rpc("accept_invites"); return NextResponse.redirect(to); }
    console.error("auth/callback failed:", error.message);
  }
  return NextResponse.redirect(new URL("/login?error=link", req.url));
}
