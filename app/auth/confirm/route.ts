import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

// Login link from the email. Uses a one-time token hash, so it works in any browser or device.
export async function GET(req: NextRequest) {
  const token_hash = req.nextUrl.searchParams.get("token_hash");
  const type = (req.nextUrl.searchParams.get("type") || "email") as EmailOtpType;
  if (token_hash) {
    const sb = await supabaseServer();
    const { error } = await sb.auth.verifyOtp({ token_hash, type });
    if (!error) { await sb.rpc("accept_invites"); return NextResponse.redirect(new URL("/app", req.url)); }
    console.error("auth/confirm failed:", error.message);
  }
  return NextResponse.redirect(new URL("/login?error=link", req.url));
}
