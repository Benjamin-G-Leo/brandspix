import type { Prisma } from "@/generated/prisma/client";

export const quoteDocInclude = {
  items: { orderBy: { sortOrder: "asc" } },
  request: { include: { customer: true } },
} satisfies Prisma.QuotationInclude;

/** YYYY-MM-DD in Indian time, for <input type="date">. */
export const toDateInput = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export function defaultValidUntil(days: number) {
  return toDateInput(new Date(Date.now() + days * 86400000));
}
