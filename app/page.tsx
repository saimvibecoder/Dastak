import Link from "next/link";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";
import Bars, { BarLabels } from "@/components/Bars";
import Footer from "@/components/Footer";
import { wa } from "@/lib/util";
import { supabaseServer } from "@/lib/supabase/server";

const FAQ: [string, string][] = [
  ["Do guests need to download an app?", "No. The phone camera reads the QR and opens a web page. Claiming takes about twenty seconds."],
  ["Is it allowed to message guests on WhatsApp?", "Only guests who tick the consent box are added. Every offer tells them how to leave the list, and they are removed when they ask."],
  ["Does it send messages automatically?", "Today you tap send for each guest, or copy the numbers into a WhatsApp Business broadcast list. Fully automatic sending through the WhatsApp Business API can be added later; Meta charges for each marketing message."],
  ["Who owns the guest list?", "Your restaurant. You can copy the full list at any time and take it with you."],
  ["What do I need at the restaurant?", "A phone with WhatsApp Business and printed QR cards for your tables. We design the cards with your name and offer."],
  ["Can my staff use it too?", "Yes. Invite them by email. Staff can check codes and send offers; only owners change settings or remove guests."],
  ["How much does Dastak cost?", "A one time setup fee plus a small monthly fee, quoted after we see your tables and menu."],
];
const SAMPLE = [6, 11, 8, 5, 7, 9, 10, 7, 12, 9, 4, 8, 13, 3].map((n, i) => ({ label: `${6 + i} Nov`, n }));
const TAG = "Your dining room is full on Saturday night. Dastak is for the Monday afternoon.";

export default async function Home() {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const book = wa(process.env.NEXT_PUBLIC_SALES_WHATSAPP, "Hi, I saw Dastak and would like a walkthrough for my restaurant.");
  return (
    <>
      <Nav current="home" signedIn={!!user} />
      <main id="main">
        <header className="hero">
          <div className="wrap">
            <span className="badge fu d1"><b></b>Built for restaurants in Lucknow</span>
            <h1 className="fu d2">Turn every diner into a <em>regular</em> on WhatsApp</h1>
            <p className="sub fu d3">A QR on every table offers a free starter. Guests leave their WhatsApp number to claim it, and you message them when Monday afternoons go quiet.</p>
            <div className="ctas fu d4">
              <a className="btn pri" href={book} target="_blank" rel="noopener">Book a free walkthrough</a>
              <a className="btn ghost" href="#how"><span className="play"><svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1l7 4-7 4z" fill="currentColor" /></svg></span>See how it works</a>
            </div>
            <p className="c2 proof fu d5">No app for your guests. No card machine changes. Your list stays yours.</p>
            <div className="pv fu d5">
              <div className="glass">
                <div className="pvin">
                  <div className="pvside"><span className="on">Overview</span><span>Guests</span><span>Send offer</span><span>Redeem code</span><span>Table QRs</span></div>
                  <div>
                    <div className="row" style={{ marginBottom: 16 }}><div><div className="c5">Sample restaurant</div><div className="t3">This week</div></div><span className="sp"></span><span className="chip ok">Live</span></div>
                    <div className="grid g4">
                      {[["Guests on list", "251", "opted in"], ["New this week", "42", "+3 vs last week"], ["Starters claimed", "69%", "182 codes used"], ["Came back", "22%", "59 repeat guests"]].map(([l, n, d]) => (
                        <div className="card kpi" style={{ padding: 16 }} key={l}><div className="c5">{l}</div><div className="n mono">{n}</div><div className="d">{d}</div></div>
                      ))}
                    </div>
                    <div className="card" style={{ marginTop: 16, padding: 16 }}>
                      <div className="row"><span className="t3 b6">New guests per day</span><span className="sp"></span><span className="c5">Sample data</span></div>
                      <Bars data={SAMPLE} height={140} /><BarLabels data={SAMPLE} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="band" id="how"><div className="wrap">
          <div className="sec-h rv"><h2>Four steps from table to <em>return</em> visit</h2><p>Everything runs on the phones your guests and staff already carry.</p></div>
          <div className="grid g4">
            {[["Guest scans the table card", "A branded QR card offers a free starter. The phone camera opens your offer page."],
              ["They claim the starter", "Name, WhatsApp number, birthday if they like, and a consent tick. They get a code to show the server."],
              ["Your list grows daily", "Every claim lands in your dashboard with the table, visit time and whether the code was used."],
              ["You fill the quiet hours", "See which slot is emptiest, pick a ready offer, and send it to your guests on WhatsApp."]].map(([t, p], i) => (
              <div className="card step rv" key={t}><div className="num">Step {i + 1}</div><h3>{t}</h3><p>{p}</p></div>
            ))}
          </div>
        </div></section>

        <section className="band" style={{ paddingTop: 0 }}><div className="wrap">
          <div className="sec-h rv"><h2>What you get from <em>your</em> list</h2></div>
          <div className="grid g2">
            {[["Guests you can reach again", "Instagram decides who sees your post. A WhatsApp message lands on the phone of every guest who opted in."],
              ["Slow hours filled on purpose", "A grid of visits by day and hour shows exactly when the dining room sits empty, so offers go out for that slot."],
              ["Birthdays and festivals ready", "The guest list sorts itself by birthday month, with templates for Eid, Diwali, weekend specials and events."],
              ["Proof of what worked", "Each offer carries a code. Mark it used at the table and see how many guests actually came back."]].map(([t, p]) => (
              <div className="card rv" key={t}><h3>{t}</h3><p>{p}</p></div>
            ))}
          </div>
        </div></section>

        <section className="band"><div className="wrap">
          <p className="tag">{TAG.split(" ").map((w, i) => <span key={i}>{w} </span>)}</p>
        </div></section>

        <section className="band"><div className="wrap" style={{ maxWidth: 780 }}>
          <div className="sec-h rv"><h2>Why WhatsApp beats <em>another</em> post</h2></div>
          <div className="card rv">
            <div className="vs"><span className="tick n">✕</span><div><div className="t3">Social media</div><p className="c2">The algorithm decides how many of your followers see an offer, and when.</p></div></div>
            <div className="vs"><span className="tick n">✕</span><div><div className="t3">Delivery apps</div><p className="c2">They own the customer and take a commission on every order.</p></div></div>
            <div className="vs"><span className="tick y">✓</span><div><div className="t3">Your WhatsApp list</div><p className="c2">Guests who chose to hear from you, reached directly, at no commission.</p></div></div>
          </div>
        </div></section>

        <section className="band" style={{ paddingTop: 0 }}><div className="wrap" style={{ maxWidth: 780 }}>
          <div className="sec-h rv"><h2>Questions owners ask</h2></div>
          <div className="rv">{FAQ.map(([q, a]) => <details className="q" key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </div></section>

        <section className="band" style={{ paddingTop: 0 }}><div className="wrap">
          <div className="final rv">
            <h2>See it running on your <em>own</em> tables</h2>
            <p className="c2" style={{ margin: "16px auto 32px", maxWidth: 520 }}>A short visit: we look at your tables and menu, pick the free starter, and set up the dashboard with your restaurant&apos;s name on it.</p>
            <div className="ctas" style={{ marginTop: 0 }}><a className="btn pri" href={book} target="_blank" rel="noopener">Book a free walkthrough</a><Link className="btn ghost" href="/login">Owner log in</Link></div>
          </div>
        </div></section>
      </main>
      <Footer />
      <Reveal />
    </>
  );
}
