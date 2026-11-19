import Nav from "@/components/Nav";
import LoginForm from "./LoginForm";
export const metadata = { title: "Log in" };
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (<><Nav current="login" /><main id="main" className="center-page"><div className="card narrow">
    <h1 style={{ fontSize: 36, lineHeight: "40px" }}>Log in to your <em>dashboard</em></h1>
    <p className="c2" style={{ margin: "12px 0 24px" }}>Enter the email your restaurant was set up with. We&apos;ll email you a code that logs you in, no password needed.</p>
    {error && <p className="notice err" style={{ marginBottom: 16 }}>That login link didn&apos;t work. Ask for a new one below and open the newest email.</p>}
    <LoginForm />
  </div></main></>);
}
