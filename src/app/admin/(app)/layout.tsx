import { Shell } from "@/components/Shell";
import { requireStaff } from "@/lib/session";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/requests", label: "Service requests" },
];

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  return <Shell area="admin" userName={user.name} nav={nav}>{children}</Shell>;
}
