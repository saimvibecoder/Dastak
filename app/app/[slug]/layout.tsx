import Nav from "@/components/Nav";
import Tabs from "./Tabs";
import InstallApp from "@/components/InstallApp";
import { requireRestaurant } from "@/lib/data";

export default async function RLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { r, role, user } = await requireRestaurant(slug);
  return (<><Nav current="app" signedIn /><main id="main" className="wrap app">
    <div className="apphead">
      <div><div className="c2">{[r.name, r.area].filter(Boolean).join(", ")}</div></div>
      <div className="row"><InstallApp /><span className="chip">{role === "owner" ? "Owner" : "Staff"} · {user.email}</span>
        <form action="/auth/signout" method="post"><button className="btn ghost sm">Log out</button></form></div>
    </div>
    <Tabs slug={slug} owner={role === "owner"} />
    {children}
  </main></>);
}
