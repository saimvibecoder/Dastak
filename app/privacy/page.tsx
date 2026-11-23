import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import { CONTACT } from "@/lib/legal";

export const metadata = { title: "Privacy policy", description: "What Dastak stores about restaurant guests and staff, why, for how long, and how to have it removed.", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (<><Nav /><main id="main" className="legal">
    <h1>Privacy policy</h1>
    <p className="c2">Last updated {CONTACT.updated}</p>

    <h2>Who we are</h2>
    <p>Dastak is a guest list tool for restaurants, run by {CONTACT.person} from Lucknow, India. A restaurant puts a Dastak QR code on its tables. Guests who scan it can join that restaurant&apos;s WhatsApp list in return for a welcome offer.</p>
    <p>For guest details, the <b>restaurant</b> decides why and how they are used, and Dastak stores and processes them on the restaurant&apos;s behalf. For restaurant owner and staff accounts, Dastak decides how those details are used.</p>

    <h2>What we store about guests</h2>
    <p>Only after a guest ticks the consent box: their name, WhatsApp number, birthday if they choose to add it, the table they scanned, the time they joined, their offer code, when the code was used and later visits the restaurant logs.</p>
    <p>To stop abuse, we also keep a scrambled, one-way version of the network address used to join or leave. It can&apos;t be turned back into the address and is used only to slow down repeated attempts.</p>
    <p>When someone just opens the QR page without joining, we count the visit. We don&apos;t store anything that identifies them.</p>

    <h2>Age</h2>
    <p>Joining a guest list is only for people aged 18 or older, and the consent box says so. If we learn that someone under 18 has joined, we remove their details. A parent can ask us to do this using the contact below.</p>

    <h2>Why we store it</h2>
    <p>So that the restaurant the guest joined can give them their welcome offer and send them offers on WhatsApp. Nothing else. Guest numbers are never sold, never shared with other restaurants and never used by Dastak to contact guests for its own purposes.</p>

    <h2>Who can see it</h2>
    <p>Only the restaurant the guest joined: its owner and the staff the owner invites. Each restaurant can see only its own guests. Dastak can see the data to run and support the service.</p>
    <p>The data is kept with two service providers that host Dastak: Supabase (the database) and Vercel (the website). They hold it for us and may not use it for anything else.</p>

    <h2>Leaving the list and deleting data</h2>
    <p>Every offer message has a link to leave. A guest can also ask the restaurant, or ask us using the contact below. When a guest leaves, their name and number are removed from the restaurant&apos;s list straight away. We keep only a one-way scrambled form of the number, so that rejoining gives back the same code instead of a second welcome offer. If the guest joins again later, their details are stored again.</p>
    <p>A restaurant owner can delete any guest at any time, and can ask for the whole list to be deleted. If a restaurant stops using Dastak, its guest list is deleted within 30 days.</p>

    <h2>Your rights</h2>
    <p>Under India&apos;s Digital Personal Data Protection Act, 2023, you can ask what we hold about you, ask us to correct it or delete it, withdraw your consent at any time, and name someone to act for you. Withdrawing consent is as easy as giving it: one tap on the leave link.</p>

    <h2>Restaurant owners and staff</h2>
    <p>We store the email address you sign in with, your role and the restaurant you belong to, so we can let you in and show you the right list. Sign in uses one time codes sent by email. Admin accounts also use a two step login code from an authenticator app.</p>

    <h2>Security</h2>
    <p>Data is sent over encrypted connections, and the database itself blocks every account from seeing any restaurant but its own. If personal data is ever exposed, we will tell the restaurants and people affected, and the Data Protection Board of India where the law requires it, as soon as we can.</p>

    <h2>Contact and complaints</h2>
    <p>For any question, correction, deletion or complaint about your data, contact {CONTACT.person} on WhatsApp at <a href={CONTACT.waLink}>{CONTACT.wa}</a> or by email at <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>. We reply within 7 days. If you aren&apos;t satisfied, you can complain to the Data Protection Board of India.</p>
    <p>We may update this policy. The date at the top shows the latest version.</p>
    <p><Link href="/terms">Terms of use</Link> · <Link href="/">Back to overview</Link></p>
  </main><Footer /></>);
}
