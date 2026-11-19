import "server-only";
import { createHash } from "crypto";
import type { NextRequest } from "next/server";

export function ipHash(req: NextRequest) {
  const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update(ip + (process.env.SUPABASE_SERVICE_ROLE_KEY || "")).digest("hex").slice(0, 32);
}
// Only accept form posts that come from our own pages.
export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).host === req.headers.get("host"); } catch { return false; }
}
