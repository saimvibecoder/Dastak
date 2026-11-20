import { asOfferType, offerShort } from "@/lib/offer";
import { requireRestaurant } from "@/lib/data";
import Redeem from "./Redeem";
export const metadata = { title: "Redeem code" };
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const { r } = await requireRestaurant(slug);
  return <Redeem slug={slug} prefix={r.code_prefix} offer={offerShort(asOfferType(r.offer_type), r.offer)} />;
}
