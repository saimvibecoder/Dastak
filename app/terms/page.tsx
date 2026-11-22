import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import { CONTACT } from "@/lib/legal";

export const metadata = { title: "Terms of use", description: "The rules for restaurants and guests using Dastak." };

export default function Terms() {
  return (<><Nav /><main id="main" className="legal">
    <h1>Terms of use</h1>
    <p className="c2">Last updated {CONTACT.updated}</p>

    <h2>For guests</h2>
    <p>Joining a restaurant&apos;s list is free, optional and only for people aged 18 or older. The welcome offer and every later offer are set by that restaurant, which is responsible for honouring them and for their conditions. Each welcome offer can be used once per number. You can leave the list at any time from the link in any message. See the <Link href="/privacy">privacy policy</Link> for what is stored and how to have it removed.</p>

    <h2>For restaurants</h2>
    <p>By using Dastak, the restaurant agrees to:</p>
    <ul>
      <li>message only guests who joined its list through Dastak, and only about the restaurant&apos;s own offers and news;</li>
      <li>stop messaging anyone who leaves the list or asks to stop, including by replying on WhatsApp, and mark them as opted out in Dastak;</li>
      <li>follow WhatsApp&apos;s Business and Commerce policies, using a separate WhatsApp number for Dastak offers;</li>
      <li>honour the offers it shows guests;</li>
      <li>keep its Dastak login private, invite only its own staff and remove staff who leave;</li>
      <li>not copy the guest list into other tools, sell it or share it with anyone else;</li>
      <li>tell Dastak straight away if it thinks guest data has been exposed or misused.</li>
    </ul>
    <p>The restaurant owns its guest list and can export or delete it at any time. Dastak stores and processes the list only to run the service for that restaurant. If the restaurant stops using Dastak, the list is deleted within 30 days.</p>

    <h2>Payment</h2>
    <p>Fees are agreed with each restaurant before setup. A restaurant can stop at any time. Fees already paid for a month that has started are not refunded, except under the written guarantee given to that restaurant.</p>

    <h2>The service</h2>
    <p>We work to keep Dastak available and secure, but it is provided as it is, and we can&apos;t promise it will never be interrupted. Dastak doesn&apos;t send WhatsApp messages on its own; the restaurant sends them from its WhatsApp. Dastak isn&apos;t responsible for WhatsApp restricting a number that breaks WhatsApp&apos;s rules. We may suspend an account that misuses guest data or breaks these terms.</p>

    <h2>Contact</h2>
    <p>{CONTACT.person}, Lucknow, India. WhatsApp <a href={CONTACT.waLink}>{CONTACT.wa}</a>, email <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>. These terms are governed by Indian law, with courts in Lucknow having jurisdiction.</p>
    <p><Link href="/privacy">Privacy policy</Link> · <Link href="/">Back to overview</Link></p>
  </main><Footer /></>);
}
