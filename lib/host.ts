import "server-only";
import { headers } from "next/headers";
// The address this request came in on, so QR codes and links always match the live domain
// (temporary Vercel address today, your own domain later) without changing any settings.
export async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
