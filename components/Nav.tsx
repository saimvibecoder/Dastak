import Link from "next/link";
import DoorLogo from "./DoorLogo";
export function Logo() {
  return (
    <Link className="logo" href="/">
      <DoorLogo size={0.18} />
      <span className="lbl">Dastak</span>
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
