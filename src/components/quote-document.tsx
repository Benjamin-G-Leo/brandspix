import Image from "next/image";
import type { QuoteStatus } from "@/generated/prisma/client";
import { BUSINESS } from "@/lib/business";
import { formatINR } from "@/lib/money";
import { fmtDate, reqNo } from "@/lib/status";

export const QUOTE_LABEL: Record<QuoteStatus, string> = {
  DRAFT: "Draft",
  SENT: "Awaiting response",
  ACCEPTED: "Accepted",
  REVISION_REQUESTED: "Changes requested",
  DECLINED: "Declined",
  SUPERSEDED: "Replaced by newer quotation",
};
const QUOTE_TONE: Record<QuoteStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-600 ring-gray-200",
  SENT: "bg-amber-50 text-amber-700 ring-amber-200",
  ACCEPTED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REVISION_REQUESTED: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  DECLINED: "bg-red-50 text-red-700 ring-red-200",
  SUPERSEDED: "bg-gray-100 text-gray-600 ring-gray-200",
};

export const isExpired = (q: { status: QuoteStatus; validUntil: Date }) => q.status === "SENT" && q.validUntil < new Date();

export function QuoteBadge({ q }: { q: { status: QuoteStatus; validUntil: Date } }) {
  const expired = isExpired(q);
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${expired ? "bg-red-50 text-red-700 ring-red-200" : QUOTE_TONE[q.status]}`}>
      {expired ? "Expired" : QUOTE_LABEL[q.status]}
    </span>
  );
}

type Doc = {
  number: string | null;
  status: QuoteStatus;
  scope: string;
  milestones: string | null;
  paymentTerms: string | null;
  validUntil: Date;
  sentAt: Date | null;
  createdAt: Date;
  discount: number;
  taxRateBp: number;
  advancePercent: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  customerNote: string | null;
  items: { id: string; description: string; quantity: number; unitPrice: number }[];
  request: {
    number: number;
    title: string;
    customer: { name: string; businessName: string | null; email: string; mobile: string | null };
  };
};

export function QuoteDocument({ q }: { q: Doc }) {
  const advance = Math.round((q.total * q.advancePercent) / 100);
  const c = q.request.customer;
  return (
    <article className="rounded-xl border border-line bg-white p-6 text-sm print:border-0 print:p-0 sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
        <div>
          <Image src="/brand/logo.png" alt="Brandspix" width={124} height={36} />
          <p className="mt-2 font-medium">{BUSINESS.legalName}</p>
          <p className="text-muted">{BUSINESS.address}</p>
          {BUSINESS.gstin && <p className="text-muted">GSTIN: {BUSINESS.gstin}</p>}
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold text-navy">Quotation</h2>
          <p className="font-medium">{q.number ?? "DRAFT"}</p>
          <p className="text-muted">Date: {fmtDate(q.sentAt ?? q.createdAt)}</p>
          <p className="text-muted">Valid until: {fmtDate(q.validUntil)}</p>
          <div className="mt-2 print:hidden"><QuoteBadge q={q} /></div>
        </div>
      </header>

      <section className="grid gap-4 border-b border-line py-5 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase text-muted">Prepared for</p>
          <p className="mt-1 font-medium">{c.name}</p>
          {c.businessName && <p>{c.businessName}</p>}
          <p className="text-muted">{c.email}{c.mobile ? ` · ${c.mobile}` : ""}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs uppercase text-muted">For request</p>
          <p className="mt-1 font-medium">{q.request.title}</p>
          <p className="text-muted">{reqNo(q.request.number)}</p>
        </div>
      </section>

      <section className="py-5">
        <h3 className="font-semibold text-navy">Scope of work</h3>
        <p className="mt-1 whitespace-pre-wrap leading-6">{q.scope}</p>
      </section>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[30rem] text-left">
          <thead className="border-y border-line text-xs uppercase text-muted">
            <tr><th className="py-2 pr-2">#</th><th className="py-2 pr-2">Description</th><th className="py-2 pr-2 text-right">Qty</th><th className="py-2 pr-2 text-right">Unit price</th><th className="py-2 text-right">Amount</th></tr>
          </thead>
          <tbody className="divide-y divide-line tabular-nums">
            {q.items.map((it, i) => (
              <tr key={it.id}>
                <td className="py-2 pr-2 text-muted">{i + 1}</td>
                <td className="py-2 pr-2">{it.description}</td>
                <td className="py-2 pr-2 text-right">{it.quantity}</td>
                <td className="py-2 pr-2 text-right">{formatINR(it.unitPrice)}</td>
                <td className="py-2 text-right">{formatINR(it.quantity * it.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="ml-auto mt-4 max-w-xs space-y-1 tabular-nums">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(q.subtotal)}</dd></div>
        {q.discount > 0 && <div className="flex justify-between"><dt>Discount</dt><dd>−{formatINR(q.discount)}</dd></div>}
        <div className="flex justify-between"><dt>GST ({q.taxRateBp / 100}%)</dt><dd>{formatINR(q.taxAmount)}</dd></div>
        <div className="flex justify-between border-t border-line pt-1 text-base font-semibold text-navy"><dt>Total</dt><dd>{formatINR(q.total)}</dd></div>
        {q.advancePercent > 0 && (
          <div className="flex justify-between text-muted"><dt>Advance due on acceptance ({q.advancePercent}%)</dt><dd>{formatINR(advance)}</dd></div>
        )}
      </dl>

      {(q.milestones || q.paymentTerms) && (
        <section className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
          {q.milestones && <div><h3 className="font-semibold text-navy">Milestones</h3><p className="mt-1 whitespace-pre-wrap leading-6">{q.milestones}</p></div>}
          {q.paymentTerms && <div><h3 className="font-semibold text-navy">Payment terms</h3><p className="mt-1 whitespace-pre-wrap leading-6">{q.paymentTerms}</p></div>}
        </section>
      )}

      {q.customerNote && (
        <section className="mt-6 rounded-lg bg-indigo-50 p-4 print:hidden">
          <h3 className="font-semibold text-navy">Customer&apos;s comments</h3>
          <p className="mt-1 whitespace-pre-wrap">{q.customerNote}</p>
        </section>
      )}

      {BUSINESS.placeholder && (
        <p className="mt-6 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Business details on this document are placeholders until Brandspix confirms its legal name, address and GSTIN.
        </p>
      )}
    </article>
  );
}
