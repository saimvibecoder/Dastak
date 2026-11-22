import Nav from "@/components/Nav";
import { requireUser } from "@/lib/data";
import { redirect } from "next/navigation";
import VerifyForm from "./VerifyForm";

export const metadata = { title: "Two-step login", robots: { index: false } };
export default async function Verify() {
  const { twoStep } = await requireUser({ allowAal1: true });
  if (!twoStep) redirect("/app");
  return (<><Nav signedIn /><main id="main" className="center-page"><div className="card narrow">
    <h1 style={{ fontSize: 36, lineHeight: "40px" }}>Enter your <em>code</em></h1>
    <p className="c2" style={{ margin: "12px 0 24px" }}>Open your authenticator app and type the 6 digit code it shows for Dastak.</p>
    <VerifyForm />
  </div></main></>);
}
