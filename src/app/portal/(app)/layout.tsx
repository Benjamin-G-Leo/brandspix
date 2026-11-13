import { Shell } from "@/components/Shell";
import { requireCustomer } from "@/lib/session";

const nav = [
  { href: "/portal/dashboard", label: "Dashboard" },
  { href: "/portal/services", label: "Services" },
  { href: "/portal/request/new", label: "New request" },
  { href: "/portal/requests", label: "My requests" },
];

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireCustomer();
  return <Shell area="portal" userName={user.name} nav={nav}>{children}</Shell>;
}
