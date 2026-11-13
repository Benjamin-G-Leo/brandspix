import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only: real authorization happens in requireCustomer()/requireStaff() on every page and action.
const PUBLIC = new Set([
  "/portal/login",
  "/portal/register",
  "/portal/forgot-password",
  "/portal/reset-password",
  "/admin/login",
]);

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.has(pathname)) return NextResponse.next();
  if (!req.cookies.get("session")) {
    const to = pathname.startsWith("/admin") ? "/admin/login" : "/portal/login";
    return NextResponse.redirect(new URL(to, req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/portal/:path*", "/admin/:path*"] };
