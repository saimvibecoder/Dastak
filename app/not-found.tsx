import Link from "next/link";
import Nav from "@/components/Nav";
export default function NotFound() {
  return (<><Nav /><main id="main" className="center-page"><div className="card narrow" style={{ textAlign: "center" }}>
    <h1 style={{ fontSize: 36, lineHeight: "40px" }}>This table is empty</h1>
    <p className="c2" style={{ margin: "12px 0 24px" }}>The page you were looking for doesn&apos;t exist, or the QR code is from a restaurant that has left Dastak.</p>
    <Link className="btn pri" href="/">Go to the overview</Link></div></main></>);
}
