"use client";
import { createBrowserClient } from "@supabase/ssr";
// Implicit flow: the emailed login link carries the session itself, so it works
// even when opened in a different browser or app than the one that asked for it.
export const supabaseBrowser = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { flowType: "implicit", detectSessionInUrl: true },
  });
