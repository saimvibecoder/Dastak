import AdminLogin from "./AdminLogin";
export const metadata = { title: "Admin", robots: { index: false, follow: false } };
// Not linked from anywhere. Password login for the Dastak admin only.
export default function Page() {
  return (<main id="main" className="center-page"><div className="card narrow">
    <h1 style={{ fontSize: 30, lineHeight: "36px" }}>Admin</h1>
    <AdminLogin /></div></main>);
}
