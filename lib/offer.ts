/** The welcome offer a guest gets for joining: a dish, drink, bite, dessert, or % off the bill. */
export const OFFER_TYPES = [
  ["dish", "A dish"], ["drink", "A drink or mocktail"], ["bite", "A small bite"], ["dessert", "A dessert"], ["percent", "% off the bill"],
] as const;
export type OfferType = (typeof OFFER_TYPES)[number][0];
export const asOfferType = (v: unknown): OfferType => (OFFER_TYPES.some(([k]) => k === v) ? (v as OfferType) : "dish");

// "a masala chai", "an iced tea", and no article for plurals like "kebab bites".
const withArticle = (w: string) => { const x = w.trim(); if (/[^s]s$/i.test(x) && !/(us|ss)$/i.test(x)) return x; return `${/^[aeiou]/i.test(x) ? "an" : "a"} ${x}`; };
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** "a masala chai on the house" / "10% off your bill" */
export const offerLine = (t: OfferType, o: string) => (t === "percent" ? `${o}% off your bill` : `${withArticle(o)} on the house`);
/** Headline on the guest page and table card. */
export const offerHeadline = (t: OfferType, o: string) => (t === "percent" ? `${o}% off your bill` : `${cap(withArticle(o))}, on the house`);
/** Short form for buttons and staff screens: "masala chai" / "10% off" */
export const offerShort = (t: OfferType, o: string) => (t === "percent" ? `${o}% off` : o);
