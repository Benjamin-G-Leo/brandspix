"use server";

import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCustomer, requireStaff } from "@/lib/session";
import type { FormState } from "@/lib/auth-actions";

import { UPLOAD_DIR } from "@/lib/uploads";
const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "text/plain": ".txt",
  "application/zip": ".zip",
};

const requestSchema = z.object({
  serviceId: z.string().min(1, "Choose a service"),
  title: z.string().trim().min(5, "Give your request a short title (5+ characters)").max(120),
  scope: z.string().trim().min(20, "Describe your scope in at least 20 characters").max(5000),
  budget: z.string().trim().max(60).optional(),
  deadline: z.string().optional(),
});

export async function createRequestAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireCustomer();
  const raw = Object.fromEntries(
    [...fd.entries()].filter(([, v]) => typeof v === "string"),
  ) as Record<string, string>;
  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message, fields: raw };
  const d = parsed.data;

  const service = await db.service.findFirst({ where: { id: d.serviceId, active: true } });
  if (!service) return { error: "Choose a valid service", fields: raw };

  let deadline: Date | null = null;
  if (d.deadline) {
    deadline = new Date(d.deadline);
    if (Number.isNaN(deadline.getTime()) || deadline < new Date(new Date().toDateString()))
      return { error: "Deadline must be a future date", fields: raw };
  }

  const files = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > MAX_FILES) return { error: `Attach at most ${MAX_FILES} files`, fields: raw };
  for (const f of files) {
    if (f.size > MAX_BYTES) return { error: `${f.name} is larger than 10 MB`, fields: raw };
    if (!ALLOWED[f.type]) return { error: `${f.name}: file type not allowed (PDF, PNG, JPG, DOCX, XLSX, TXT, ZIP)`, fields: raw };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const saved: { fileName: string; storedName: string; mimeType: string; size: number }[] = [];
  for (const f of files) {
    const storedName = randomBytes(16).toString("hex") + ALLOWED[f.type];
    await writeFile(path.join(UPLOAD_DIR, storedName), Buffer.from(await f.arrayBuffer()));
    saved.push({ fileName: f.name.slice(0, 200), storedName, mimeType: f.type, size: f.size });
  }

  const req = await db.serviceRequest.create({
    data: {
      customerId: user.id,
      serviceId: service.id,
      title: d.title,
      scope: d.scope,
      budget: d.budget || null,
      deadline,
      attachments: { create: saved },
    },
  });
  await db.auditLog.create({ data: { actorId: user.id, action: "request.create", entity: "ServiceRequest", entityId: req.id } });
  redirect(`/portal/requests/${req.id}`);
}

export async function customerReplyAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireCustomer();
  const requestId = String(fd.get("requestId"));
  const body = String(fd.get("body") ?? "").trim();
  if (!body) return { error: "Write a message first" };
  if (body.length > 3000) return { error: "Message is too long" };
  const req = await db.serviceRequest.findFirst({ where: { id: requestId, customerId: user.id } });
  if (!req) return { error: "Request not found" };
  await db.requestNote.create({ data: { requestId, authorId: user.id, body, internal: false } });
  if (req.status === "AWAITING_CUSTOMER")
    await db.serviceRequest.update({ where: { id: requestId }, data: { status: "UNDER_REVIEW" } });
  revalidatePath(`/portal/requests/${requestId}`);
  return { message: "Message sent" };
}

const updateSchema = z.object({
  requestId: z.string(),
  status: z.enum(["NEW", "UNDER_REVIEW", "QUOTED", "APPROVED", "IN_PROGRESS", "AWAITING_CUSTOMER", "COMPLETED", "CANCELLED"]),
  priority: z.enum(["LOW", "NORMAL", "HIGH"]),
  assignedToId: z.string().optional(),
});

export async function updateRequestAction(_: FormState, fd: FormData): Promise<FormState> {
  const staff = await requireStaff();
  const parsed = updateSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: "Invalid values" };
  const { requestId, status, priority, assignedToId } = parsed.data;
  if (assignedToId && !(await db.user.findFirst({ where: { id: assignedToId, role: { in: ["ADMIN", "STAFF"] } } })))
    return { error: "Invalid assignee" };
  await db.serviceRequest.update({
    where: { id: requestId },
    data: { status, priority, assignedToId: assignedToId || null },
  });
  await db.auditLog.create({
    data: { actorId: staff.id, action: "request.update", entity: "ServiceRequest", entityId: requestId, detail: `${status}/${priority}` },
  });
  revalidatePath(`/admin/requests/${requestId}`);
  return { message: "Request updated" };
}

export async function staffNoteAction(_: FormState, fd: FormData): Promise<FormState> {
  const staff = await requireStaff();
  const requestId = String(fd.get("requestId"));
  const body = String(fd.get("body") ?? "").trim();
  const internal = fd.get("internal") === "on";
  if (!body) return { error: "Write a message first" };
  if (body.length > 3000) return { error: "Message is too long" };
  if (!(await db.serviceRequest.findUnique({ where: { id: requestId } }))) return { error: "Request not found" };
  await db.requestNote.create({ data: { requestId, authorId: staff.id, body, internal } });
  revalidatePath(`/admin/requests/${requestId}`);
  return { message: internal ? "Internal note saved" : "Message sent to customer" };
}
