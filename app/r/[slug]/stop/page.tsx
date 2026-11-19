import { notFound } from "next/navigation";
import { getPublicRestaurant } from "@/lib/public";
import StopForm from "./StopForm";
export const metadata = { title: "Leave the list", robots: { index: false } };
export default async function Stop({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const r = await getPublicRestaurant(slug);
  if (!r) notFound();
  return (<div className="gwrap" data-pal={r.palette}><main id="main" className="center-page"><div className="card narrow">
    <h1 style={{ fontSize: 30, lineHeight: "36px" }}>Leave {r.name}&apos;s list</h1>
    <p className="c2" style={{ margin: "12px 0 24px" }}>Enter the number you joined with. You won&apos;t get offers from {r.name} on WhatsApp after this.</p>
    <StopForm slug={slug} name={r.name} /></div></main></div>);
}
