import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  // Fast gate only: reads the signed-in cookie (and refreshes it when it expires)
  // without a round trip to the auth server. Every page still verifies the user
  // with getUser(), and the database checks access with RLS.
  const { data: { session } } = await sb.auth.getSession();
  const user = session?.user;
  const p = req.nextUrl.pathname;
  if (!user && p.startsWith("/admin") && p !== "/admin/login") {
    const u = req.nextUrl.clone(); u.pathname = "/admin/login"; u.search = ""; return NextResponse.redirect(u);
  }
  if (!user && p.startsWith("/app")) {
    const u = req.nextUrl.clone(); u.pathname = "/login"; u.search = ""; return NextResponse.redirect(u);
  }
  return res;
}
export const config = { matcher: ["/app/:path*", "/admin/:path*", "/login", "/verify", "/auth/:path*"] };
