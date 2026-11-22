// Temporary: measures how far the database is from the server. Removed before going live.
export const dynamic = "force-dynamic";
export async function GET() {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL!, k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const out: Record<string, unknown> = { fnRegion: process.env.VERCEL_REGION };
  const t = async (name: string, url: string) => {
    const s = Date.now(); const r = await fetch(url, { headers: { apikey: k }, cache: "no-store" });
    out[name] = Date.now() - s; return r;
  };
  const r = await t("auth1", `${u}/auth/v1/health`);
  out.hdr = Object.fromEntries([...r.headers].filter(([h]) => /region|cf-ray|sb-|server|via/i.test(h)));
  await t("auth2", `${u}/auth/v1/health`);
  await t("auth3", `${u}/auth/v1/health`);
  await t("rest1", `${u}/rest/v1/`);
  return Response.json(out);
}
