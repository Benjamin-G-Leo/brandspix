"use server";

import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession, isStaff } from "@/lib/session";

export type FormState = { error?: string; message?: string; fields?: Record<string, string> } | undefined;

// Basic in-memory throttle (per server instance). Replace with Redis/DB-backed limiter in production.
const attempts = new Map<string, { n: number; reset: number }>();
function throttled(key: string, max = 8, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const a = attempts.get(key);
  if (!a || a.reset < now) {
    attempts.set(key, { n: 1, reset: now + windowMs });
    return false;
  }
  a.n += 1;
  return a.n > max;
}

const hash = (t: string) => createHash("sha256").update(t).digest("hex");

const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  businessName: z.string().trim().optional(),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  mobile: z.string().trim().regex(/^[+\d][\d\s-]{7,15}$/, "Enter a valid mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function registerAction(_: FormState, fd: FormData): Promise<FormState> {
  const raw = Object.fromEntries(fd) as Record<string, string>;
  const parsed = registerSchema.safeParse(raw);
  const fields = { ...raw, password: "" };
  if (!parsed.success) return { error: parsed.error.issues[0].message, fields };
  const { name, businessName, email, mobile, password } = parsed.data;
  if (await db.user.findUnique({ where: { email } }))
    return { error: "An account with this email already exists", fields };
  const user = await db.user.create({
    data: { name, businessName: businessName || null, email, mobile, passwordHash: await bcrypt.hash(password, 12) },
  });
  await createSession(user.id, user.role);
  redirect("/portal/dashboard");
}

async function signIn(fd: FormData, area: "portal" | "admin"): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (throttled(`login:${area}:${email}`)) return { error: "Too many attempts. Try again in 15 minutes.", fields: { email } };
  const user = await db.user.findUnique({ where: { email } });
  // compare even when user is missing to keep timing similar
  const ok = await bcrypt.compare(password, user?.passwordHash ?? "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvali");
  const allowed = user && ok && user.active && (area === "admin" ? isStaff(user.role) : !isStaff(user.role));
  if (!user || !allowed) return { error: "Invalid email or password", fields: { email } };
  await createSession(user.id, user.role);
  redirect(area === "admin" ? "/admin/dashboard" : "/portal/dashboard");
}

export async function customerLoginAction(_: FormState, fd: FormData) {
  return signIn(fd, "portal");
}
export async function adminLoginAction(_: FormState, fd: FormData) {
  return signIn(fd, "admin");
}

export async function logoutAction(fd: FormData) {
  const to = String(fd.get("to") ?? "/portal/login");
  await destroySession();
  redirect(to.startsWith("/admin") ? "/admin/login" : "/portal/login");
}

export async function forgotPasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (throttled(`forgot:${email}`, 3)) return { error: "Too many requests. Try again later." };
  const user = await db.user.findUnique({ where: { email } });
  if (user && user.active) {
    const token = randomBytes(32).toString("hex");
    await db.passwordReset.create({
      data: { userId: user.id, tokenHash: hash(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    // TODO: send via email provider. Until one is configured, log the link for development.
    console.log(`[dev] password reset link for ${email}: /portal/reset-password?token=${token}`);
  }
  // Same response whether or not the account exists.
  return { message: "If an account exists for that email, a reset link has been sent." };
}

export async function resetPasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const token = String(fd.get("token") ?? "");
  const password = String(fd.get("password") ?? "");
  if (password.length < 8) return { error: "Password must be at least 8 characters" };
  const rec = await db.passwordReset.findUnique({ where: { tokenHash: hash(token) } });
  if (!rec || rec.usedAt || rec.expiresAt < new Date()) return { error: "This reset link is invalid or has expired" };
  await db.$transaction([
    db.user.update({ where: { id: rec.userId }, data: { passwordHash: await bcrypt.hash(password, 12) } }),
    db.passwordReset.update({ where: { id: rec.id }, data: { usedAt: new Date() } }),
  ]);
  redirect("/portal/login?reset=1");
}
