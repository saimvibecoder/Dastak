import Nav from "@/components/Nav";
import Finish from "./Finish";
export const metadata = { title: "Logging in", robots: { index: false } };
export default function Page() {
  return (<><Nav /><main id="main" className="center-page"><div className="card narrow" style={{ textAlign: "center" }}><Finish /></div></main></>);
}
