"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCustomer, requireStaff } from "@/lib/session";
import { computeTotals, toPaise } from "@/lib/money";
import { QUOTE_DEFAULTS } from "@/lib/business";
import type { FormState } from "@/lib/auth-actions";
import type { Prisma } from "@/generated/prisma/client";

const IST_END_OF_DAY = "T23:59:59+05:30";

const itemSchema = z.object({
  description: z.string().trim().min(1, "Every line item needs a description").max(300),
  quantity: z.coerce.number().int("Quantity must be a whole number").min(1, "Quantity must be at least 1").max(10000),
  unitPrice: z.string(),
});

const quoteSchema = z.object({
  quoteId: z.string().optional(),
  requestId: z.string().min(1),
  scope: z.string().trim().min(10, "Describe the scope (10+ characters)").max(8000),
  milestones: z.string().trim().max(4000).optional(),
  paymentTerms: z.string().trim().max(2000).optional(),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date"),
  discount: z.string().optional(),
  taxRate: z.coerce.number().min(0, "Tax rate can't be negative").max(28, "Tax rate looks too high"),
  advancePercent: z.coerce.number().int().min(0).max(100, "Advance must be 0–100%"),
  items: z.string(),
});

function parseQuote(fd: FormData) {
  const parsed = quoteSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message } as const;
  const d = parsed.data;

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(d.items);
  } catch {
    return { error: "Line items could not be read" } as const;
  }
  const itemsParsed = z.array(itemSchema).min(1, "Add at least one line item").max(50).safeParse(rawItems);
  if (!itemsParsed.success) return { error: itemsParsed.error.issues[0].message } as const;

  const items = [];
  for (const [i, it] of itemsParsed.data.entries()) {
    const unitPrice = toPaise(it.unitPrice);
    if (unitPrice === null) return { error: `Line ${i + 1}: enter a valid price in rupees` } as const;
    items.push({ description: it.description, quantity: it.quantity, unitPrice, sortOrder: i });
  }
  const discount = d.discount ? toPaise(d.discount) : 0;
  if (discount === null) return { error: "Enter a valid discount in rupees" } as const;

  const validUntil = new Date(d.validUntil + IST_END_OF_DAY);
  if (Number.isNaN(validUntil.getTime()) || validUntil < new Date()) return { error: "Valid-until date must be today or later" } as const;

  const taxRateBp = Math.round(d.taxRate * 100);
  const totals = computeTotals(items, discount, taxRateBp, d.advancePercent);
  if (discount > totals.subtotal) return { error: "Discount can't be more than the subtotal" } as const;

  return {
    data: {
      quoteId: d.quoteId,
      requestId: d.requestId,
      fields: {
        scope: d.scope,
        milestones: d.milestones || null,
        paymentTerms: d.paymentTerms || null,
        validUntil,
        discount: totals.discount,
        taxRateBp,
        advancePercent: d.advancePercent,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        total: totals.total,
      },
      items,
    },
  } as const;
}

export async function saveQuoteAction(_: FormState, fd: FormData): Promise<FormState> {
  const staff = await requireStaff();
  const result = parseQuote(fd);
  if ("error" in result) return { error: result.error };
  const { quoteId, requestId, fields, items } = result.data;

  if (!(await db.serviceRequest.findUnique({ where: { id: requestId } }))) return { error: "Request not found" };

  let id = quoteId;
  if (quoteId) {
    const existing = await db.quotation.findUnique({ where: { id: quoteId } });
    if (!existing || existing.requestId !== requestId) return { error: "Quotation not found" };
    if (existing.status !== "DRAFT") return { error: "Only draft quotations can be edited" };
    await db.$transaction([
      db.quotationItem.deleteMany({ where: { quotationId: quoteId } }),
      db.quotation.update({ where: { id: quoteId }, data: { ...fields, items: { create: items } } }),
    ]);
  } else {
    const created = await db.quotation.create({
      data: { ...fields, requestId, createdById: staff.id, items: { create: items } },
    });
    id = created.id;
    await db.auditLog.create({ data: { actorId: staff.id, action: "quote.create", entity: "Quotation", entityId: id } });
  }
  revalidatePath(`/admin/quotations/${id}`);
  redirect(`/admin/quotations/${id}?saved=1`);
}

async function nextQuoteNumber(tx: Prisma.TransactionClient) {
  const year = new Date().getFullYear();
  const counter = await tx.counter.upsert({
    where: { key: `Q-${year}` },
    create: { key: `Q-${year}`, value: 1 },
    update: { value: { increment: 1 } },
  });
  return `BPX-Q-${year}-${String(counter.value).padStart(4, "0")}`;
}

export async function sendQuoteAction(_: FormState, fd: FormData): Promise<FormState> {
  const staff = await requireStaff();
  const quoteId = String(fd.get("quoteId"));
  const quote = await db.quotation.findUnique({ where: { id: quoteId }, include: { items: true } });
  if (!quote) return { error: "Quotation not found" };
  if (quote.status !== "DRAFT") return { error: "This quotation has already been sent" };
  if (quote.items.length === 0) return { error: "Add at least one line item before sending" };
  if (quote.validUntil < new Date()) return { error: "The valid-until date has passed. Edit the draft first." };

  const number = await db.$transaction(async (tx) => {
    const n = await nextQuoteNumber(tx);
    const updated = await tx.quotation.updateMany({
      where: { id: quoteId, status: "DRAFT" },
      data: { status: "SENT", number: n, sentAt: new Date() },
    });
    if (updated.count === 0) throw new Error("already sent");
    // Only one live quotation per request.
    await tx.quotation.updateMany({
      where: { requestId: quote.requestId, id: { not: quoteId }, status: { in: ["SENT", "REVISION_REQUESTED"] } },
      data: { status: "SUPERSEDED" },
    });
    await tx.serviceRequest.update({ where: { id: quote.requestId }, data: { status: "QUOTATION_SENT" } });
    await tx.requestNote.create({
      data: { requestId: quote.requestId, authorId: staff.id, body: `Quotation ${n} has been sent. Please review it under Quotations.` },
    });
    await tx.auditLog.create({ data: { actorId: staff.id, action: "quote.send", entity: "Quotation", entityId: quoteId, detail: n } });
    return n;
  }).catch(() => null);

  if (!number) return { error: "This quotation has already been sent" };
  revalidatePath(`/admin/quotations/${quoteId}`);
  // TODO: email the customer once an email provider is configured.
  return { message: `Sent as ${number}` };
}

export async function reviseQuoteAction(_: FormState, fd: FormData): Promise<FormState> {
  const staff = await requireStaff();
  const source = await db.quotation.findUnique({ where: { id: String(fd.get("quoteId")) }, include: { items: true } });
  if (!source) return { error: "Quotation not found" };
  if (!["SENT", "REVISION_REQUESTED", "DECLINED"].includes(source.status)) return { error: "This quotation can't be revised" };
  const validUntil = new Date(Date.now() + QUOTE_DEFAULTS.validityDays * 86400000);
  const copy = await db.quotation.create({
    data: {
      requestId: source.requestId,
      createdById: staff.id,
      scope: source.scope,
      milestones: source.milestones,
      paymentTerms: source.paymentTerms,
      validUntil,
      discount: source.discount,
      taxRateBp: source.taxRateBp,
      advancePercent: source.advancePercent,
      subtotal: source.subtotal,
      taxAmount: source.taxAmount,
      total: source.total,
      items: { create: source.items.map(({ description, quantity, unitPrice, sortOrder }) => ({ description, quantity, unitPrice, sortOrder })) },
    },
  });
  await db.auditLog.create({ data: { actorId: staff.id, action: "quote.revise", entity: "Quotation", entityId: copy.id, detail: `from ${source.number}` } });
  redirect(`/admin/quotations/${copy.id}`);
}

export async function deleteDraftAction(fd: FormData) {
  await requireStaff();
  const quote = await db.quotation.findUnique({ where: { id: String(fd.get("quoteId")) } });
  if (quote?.status === "DRAFT") await db.quotation.delete({ where: { id: quote.id } });
  redirect(quote ? `/admin/requests/${quote.requestId}` : "/admin/quotations");
}

const responseSchema = z.object({
  quoteId: z.string(),
  decision: z.enum(["accept", "revise", "decline"]),
  note: z.string().trim().max(2000).optional(),
  agree: z.string().optional(),
});

export async function respondQuoteAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireCustomer();
  const parsed = responseSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: "Invalid response" };
  const { quoteId, decision, note, agree } = parsed.data;

  const quote = await db.quotation.findFirst({ where: { id: quoteId, request: { customerId: user.id } } });
  if (!quote) return { error: "Quotation not found" };
  if (quote.status !== "SENT") return { error: "This quotation is no longer open for a response" };
  if (decision === "accept") {
    if (quote.validUntil < new Date()) return { error: "This quotation has expired. Request a revision to get an updated one." };
    if (agree !== "on") return { error: "Please confirm you accept the scope, price and terms" };
  }
  if (decision === "revise" && !note) return { error: "Tell us what you'd like changed" };

  const next = {
    accept: { quote: "ACCEPTED", request: quote.advancePercent > 0 ? "PAYMENT_PENDING" : "IN_PROGRESS" },
    revise: { quote: "REVISION_REQUESTED", request: "UNDER_REVIEW" },
    decline: { quote: "DECLINED", request: "ON_HOLD" },
  } as const;
  const label = { accept: "accepted", revise: "requested changes to", decline: "declined" }[decision];

  const ok = await db.$transaction(async (tx) => {
    const res = await tx.quotation.updateMany({
      where: { id: quoteId, status: "SENT" },
      data: { status: next[decision].quote, respondedAt: new Date(), customerNote: note || null },
    });
    if (res.count === 0) return false;
    await tx.serviceRequest.update({ where: { id: quote.requestId }, data: { status: next[decision].request } });
    await tx.requestNote.create({
      data: { requestId: quote.requestId, authorId: user.id, body: `I have ${label} quotation ${quote.number}.${note ? `\n\n${note}` : ""}` },
    });
    await tx.auditLog.create({ data: { actorId: user.id, action: { accept: "quote.accept", revise: "quote.changes_requested", decline: "quote.decline" }[decision], entity: "Quotation", entityId: quoteId } });
    return true;
  });
  if (!ok) return { error: "This quotation is no longer open for a response" };
  revalidatePath(`/portal/quotations/${quoteId}`);
  return {
    message: {
      accept: "Thank you! Quotation accepted. We'll be in touch about the next step.",
      revise: "Your change request has been sent. We'll send an updated quotation.",
      decline: "You have declined this quotation.",
    }[decision],
  };
}
