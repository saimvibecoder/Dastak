import "server-only";
import { createClient } from "@supabase/supabase-js";

// Service role client: bypasses row level security. Only used in API routes that call
// the locked down claim_offer / opt_out functions. Never import this in client code.
export function supabaseService() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false } });
}
