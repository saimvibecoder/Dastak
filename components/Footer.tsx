import Link from "next/link";
export default function Footer() {
  return (
    <footer><div className="wrap"><span className="c2">Dastak · a guest list for restaurants</span>
      <span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/">Overview</Link></span></div></footer>
  );
}
