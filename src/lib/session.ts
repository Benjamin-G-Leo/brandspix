import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import type { Role } from "@/generated/prisma/client";

const COOKIE = "session";
const MAX_AGE = 60 * 60 * 24 * 7;

function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must be set (32+ chars)");
  return new TextEncoder().encode(secret);
}

export async function createSession(userId: string, role: Role) {
  const token = await new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/** Returns the current user from the database (never trusts the token's role alone). */
export const getUser = cache(async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    if (!payload.sub) return null;
    const user = await db.user.findUnique({ where: { id: payload.sub } });
    return user && user.active ? user : null;
  } catch {
    return null;
  }
});

export const isStaff = (role: Role) => role === "ADMIN" || role === "STAFF";

/** Use at the top of every customer page / action. */
export async function requireCustomer() {
  const user = await getUser();
  if (!user) redirect("/portal/login");
  if (isStaff(user.role)) redirect("/admin/dashboard");
  return user;
}

/** Use at the top of every admin page / action. */
export async function requireStaff() {
  const user = await getUser();
  if (!user) redirect("/admin/login");
  if (!isStaff(user.role)) redirect("/portal/dashboard");
  return user;
}
