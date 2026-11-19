import Nav from "@/components/Nav";
import Link from "next/link";
export const metadata = { title: "Privacy" };
export default function Privacy() {
  return (<><Nav /><main id="main" className="legal">
    <h1>Privacy</h1>
    <p>When a guest scans a table QR, Dastak stores their name, WhatsApp number, optional birthday, the table and the time, only after they tick consent to receive offers from that restaurant on WhatsApp.</p>
    <p>Each restaurant can see only its own guests. Guest numbers are never sold or shared with other restaurants.</p>
    <p>Guests can leave a restaurant&apos;s list at any time from the link in its messages, or by asking the restaurant. Restaurants can delete a guest&apos;s record on request.</p>
    <p>Restaurant staff sign in with an email link. We store their email address to let them in.</p>
    <p><Link href="/">Back to overview</Link></p>
  </main></>);
}
