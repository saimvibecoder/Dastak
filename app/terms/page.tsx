import Nav from "@/components/Nav";
import Link from "next/link";
export const metadata = { title: "Terms" };
export default function Terms() {
  return (<><Nav /><main id="main" className="legal">
    <h1>Terms</h1>
    <p>Restaurants using Dastak agree to message only guests who opted in, to honour every request to stop, and to follow WhatsApp&apos;s Business and Commerce policies.</p>
    <p>Offers shown to guests are set by the restaurant, which is responsible for honouring them.</p>
    <p>The restaurant owns its guest list and can export or delete it at any time.</p>
    <p><Link href="/">Back to overview</Link></p>
  </main></>);
}
