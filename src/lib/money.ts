// All amounts are integer paise. Pure helpers, safe to use on client and server.

export const formatINR = (paise: number) =>
  "₹" + (paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Parses a rupee amount like "1,250.50" into paise. Returns null if invalid. */
export function toPaise(value: string | number): number | null {
  const s = String(value).replace(/[,₹\s]/g, "");
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(s)) return null;
  const [rupees, frac = ""] = s.split(".");
  return Number(rupees) * 100 + Number((frac + "00").slice(0, 2));
}

export const paiseToInput = (paise: number) => (paise % 100 === 0 ? String(paise / 100) : (paise / 100).toFixed(2));

export function computeTotals(
  items: { quantity: number; unitPrice: number }[],
  discount: number,
  taxRateBp: number,
  advancePercent: number,
) {
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const appliedDiscount = Math.min(Math.max(discount, 0), subtotal);
  const taxable = subtotal - appliedDiscount;
  const taxAmount = Math.round((taxable * taxRateBp) / 10000);
  const total = taxable + taxAmount;
  const advance = Math.round((total * advancePercent) / 100);
  return { subtotal, discount: appliedDiscount, taxable, taxAmount, total, advance };
}
