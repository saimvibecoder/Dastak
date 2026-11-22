import Link from "next/link";
import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { requireUser } from "@/lib/data";
import Enroll from "./Enroll";

export const metadata = { title: "Two-step login", robots: { index: false } };
export default async function Security() {
  const { sb, user, twoStep } = await requireUser();
  const { data: adm } = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!adm) redirect("/app");
  return (<><Nav current="app" signedIn /><main id="main" className="center-page"><div className="card narrow">
    <h1 style={{ fontSize: 36, lineHeight: "40px" }}>Two-step <em>login</em></h1>
    {twoStep ? (<>
      <p className="c2" style={{ margin: "12px 0 24px" }}>Two-step login is on. Each time you sign in as admin, Dastak asks for the code from your authenticator app.</p>
      <Link className="btn pri" href="/admin">Back to admin</Link></>)
    : (<>
      <p className="c2" style={{ margin: "12px 0 24px" }}>Your admin account can see every restaurant&apos;s guests, so it needs a second lock. Install Google Authenticator or Microsoft Authenticator on your phone, then scan the code below.</p>
      <Enroll /></>)}
  </div></main></>);
}
