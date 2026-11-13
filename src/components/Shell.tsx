import Link from "next/link";
import { logoutAction } from "@/lib/auth-actions";

type NavItem = { href: string; label: string };

export function Shell({
  area,
  userName,
  nav,
  children,
}: {
  area: "portal" | "admin";
  userName: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-navy text-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0">
        <div className="flex items-center justify-between px-5 py-4 md:block">
          <Link href={`/${area}/dashboard`} className="text-lg font-semibold tracking-tight">
            brandspix
            <span className="ml-2 rounded bg-white/15 px-1.5 py-0.5 align-middle text-[10px] uppercase tracking-wider">
              {area === "admin" ? "Admin" : "Portal"}
            </span>
          </Link>
        </div>
        <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-1 md:overflow-visible">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block whitespace-nowrap rounded-lg px-3 py-2 text-sm text-white/85 hover:bg-white/10 hover:text-white"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="hidden px-3 md:absolute md:bottom-4 md:block md:w-60">
          <input type="hidden" name="to" value={`/${area}/login`} />
          <p className="px-3 pb-2 text-xs text-white/60">{userName}</p>
          <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/85 hover:bg-white/10">Sign out</button>
        </form>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mb-4 flex items-center justify-end gap-3 text-sm md:hidden">
          <span className="text-muted">{userName}</span>
          <form action={logoutAction}>
            <input type="hidden" name="to" value={`/${area}/login`} />
            <button className="font-medium text-brand">Sign out</button>
          </form>
        </div>
        {children}
      </main>
    </div>
  );
}
