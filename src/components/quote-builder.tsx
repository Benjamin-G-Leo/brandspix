"use client";

import { useActionState, useState } from "react";
import { saveQuoteAction } from "@/lib/quote-actions";
import { computeTotals, formatINR, toPaise } from "@/lib/money";
import { btnOutline, btnPrimary, inputCls } from "@/components/ui";

type Item = { description: string; quantity: string; unitPrice: string };

export type QuoteInitial = {
  quoteId?: string;
  requestId: string;
  scope: string;
  milestones: string;
  paymentTerms: string;
  validUntil: string; // YYYY-MM-DD
  discount: string;
  taxRate: string;
  advancePercent: string;
  items: Item[];
};

export function QuoteBuilder({ initial }: { initial: QuoteInitial }) {
  const [state, action, pending] = useActionState(saveQuoteAction, undefined);
  const [v, setV] = useState(initial);
  const [items, setItems] = useState<Item[]>(initial.items.length ? initial.items : [{ description: "", quantity: "1", unitPrice: "" }]);

  const set = (k: keyof QuoteInitial) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));
  const setItem = (i: number, k: keyof Item, value: string) =>
    setItems((list) => list.map((it, j) => (j === i ? { ...it, [k]: value } : it)));

  const parsedItems = items.map((it) => ({ quantity: Math.max(0, Math.floor(Number(it.quantity) || 0)), unitPrice: toPaise(it.unitPrice) ?? 0 }));
  const t = computeTotals(parsedItems, toPaise(v.discount || "0") ?? 0, Math.round((Number(v.taxRate) || 0) * 100), Number(v.advancePercent) || 0);

  return (
    <form action={action} className="space-y-6">
      {state?.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {initial.quoteId && <input type="hidden" name="quoteId" value={initial.quoteId} />}
      <input type="hidden" name="requestId" value={initial.requestId} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <div>
        <label htmlFor="scope" className="text-sm font-medium text-navy">Scope of work</label>
        <textarea id="scope" name="scope" rows={5} required value={v.scope} onChange={set("scope")} className={inputCls} />
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-navy">Line items</legend>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-sm">
            <thead className="text-left text-xs uppercase text-muted">
              <tr><th className="py-1 pr-2">Description</th><th className="w-20 py-1 pr-2">Qty</th><th className="w-36 py-1 pr-2">Unit price (₹)</th><th className="w-32 py-1 pr-2 text-right">Amount</th><th className="w-10" /></tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td className="py-1 pr-2">
                    <label className="sr-only" htmlFor={`d${i}`}>Line {i + 1} description</label>
                    <input id={`d${i}`} value={it.description} onChange={(e) => setItem(i, "description", e.target.value)} className={`${inputCls} !mt-0`} placeholder="e.g. Website design (5 pages)" />
                  </td>
                  <td className="py-1 pr-2">
                    <label className="sr-only" htmlFor={`q${i}`}>Line {i + 1} quantity</label>
                    <input id={`q${i}`} inputMode="numeric" value={it.quantity} onChange={(e) => setItem(i, "quantity", e.target.value)} className={`${inputCls} !mt-0`} />
                  </td>
                  <td className="py-1 pr-2">
                    <label className="sr-only" htmlFor={`p${i}`}>Line {i + 1} unit price</label>
                    <input id={`p${i}`} inputMode="decimal" value={it.unitPrice} onChange={(e) => setItem(i, "unitPrice", e.target.value)} className={`${inputCls} !mt-0`} placeholder="0" />
                  </td>
                  <td className="py-1 pr-2 text-right tabular-nums">{formatINR(parsedItems[i].quantity * parsedItems[i].unitPrice)}</td>
                  <td className="py-1 text-right">
                    <button type="button" onClick={() => setItems((l) => l.filter((_, j) => j !== i))} disabled={items.length === 1}
                      className="rounded px-2 py-1 text-muted hover:bg-surface hover:text-red-600 disabled:opacity-30" aria-label={`Remove line ${i + 1}`}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className={`${btnOutline} mt-2`} onClick={() => setItems((l) => [...l, { description: "", quantity: "1", unitPrice: "" }])} disabled={items.length >= 50}>
          + Add line
        </button>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="discount" className="text-sm font-medium text-navy">Discount (₹)</label>
          <input id="discount" name="discount" inputMode="decimal" value={v.discount} onChange={set("discount")} className={inputCls} placeholder="0" />
        </div>
        <div>
          <label htmlFor="taxRate" className="text-sm font-medium text-navy">GST rate (%)</label>
          <input id="taxRate" name="taxRate" inputMode="decimal" value={v.taxRate} onChange={set("taxRate")} className={inputCls} />
        </div>
        <div>
          <label htmlFor="advancePercent" className="text-sm font-medium text-navy">Advance (%)</label>
          <input id="advancePercent" name="advancePercent" inputMode="numeric" value={v.advancePercent} onChange={set("advancePercent")} className={inputCls} />
        </div>
        <div>
          <label htmlFor="validUntil" className="text-sm font-medium text-navy">Valid until</label>
          <input id="validUntil" name="validUntil" type="date" required value={v.validUntil} onChange={set("validUntil")} className={inputCls} />
        </div>
      </div>

      <dl className="ml-auto max-w-xs space-y-1 rounded-lg bg-surface p-4 text-sm tabular-nums">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(t.subtotal)}</dd></div>
        {t.discount > 0 && <div className="flex justify-between"><dt>Discount</dt><dd>−{formatINR(t.discount)}</dd></div>}
        <div className="flex justify-between"><dt>GST ({v.taxRate || 0}%)</dt><dd>{formatINR(t.taxAmount)}</dd></div>
        <div className="flex justify-between border-t border-line pt-1 font-semibold text-navy"><dt>Total</dt><dd>{formatINR(t.total)}</dd></div>
        <div className="flex justify-between text-muted"><dt>Advance ({v.advancePercent || 0}%)</dt><dd>{formatINR(t.advance)}</dd></div>
      </dl>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="milestones" className="text-sm font-medium text-navy">Milestones (optional)</label>
          <textarea id="milestones" name="milestones" rows={4} value={v.milestones} onChange={set("milestones")} className={inputCls} placeholder={"1. Design approval – week 1\n2. Development – weeks 2–3\n3. Launch – week 4"} />
        </div>
        <div>
          <label htmlFor="paymentTerms" className="text-sm font-medium text-navy">Payment terms (optional)</label>
          <textarea id="paymentTerms" name="paymentTerms" rows={4} value={v.paymentTerms} onChange={set("paymentTerms")} className={inputCls} placeholder="Advance before work starts; balance on delivery." />
        </div>
      </div>

      <button className={btnPrimary} disabled={pending}>{pending ? "Saving…" : "Save draft"}</button>
    </form>
  );
}
