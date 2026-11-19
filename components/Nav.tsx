import Link from "next/link";
export function Logo() {
  return (
    <Link className="logo" href="/">
      <i><svg width="14" height="14" viewBox="0 0 32 32" aria-hidden="true"><path d="M8 6h8a10 10 0 010 20H8z" fill="none" stroke="#fff" strokeWidth="4" /></svg></i>
      <span>Dastak</span>
    </Link>
  );
}
export default function Nav({ current, signedIn }: { current?: "home" | "app" | "login"; signedIn?: boolean }) {
  return (
    <nav className="nav" aria-label="Main">
      <Logo />
      <Link className="lk" href="/" aria-current={current === "home" ? "page" : undefined}>Overview</Link>
      {signedIn ? (
        <Link className="lk" href="/app" aria-current={current === "app" ? "page" : undefined}>Dashboard</Link>
      ) : (
        <Link className="lk" href="/login" aria-current={current === "login" ? "page" : undefined}>Log in</Link>
      )}
    </nav>
  );
}
