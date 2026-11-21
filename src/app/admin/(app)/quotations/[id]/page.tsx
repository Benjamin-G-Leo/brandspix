import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { Card, PageHeader, btnOutline } from "@/components/ui";
import { QuoteBuilder } from "@/components/quote-builder";
import { QuoteBadge, QuoteDocument } from "@/components/quote-document";
import { PrintButton, ReviseQuoteButton, SendQuoteButton } from "@/components/quote-actions-ui";
import { deleteDraftAction } from "@/lib/quote-actions";
import { paiseToInput } from "@/lib/money";
import { quoteDocInclude, toDateInput } from "@/lib/quote-query";
import { reqNo } from "@/lib/status";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireStaff();
  const { id } = await params;
  const { saved } = await searchParams;
  const q = await db.quotation.findUnique({ where: { id }, include: quoteDocInclude });
  if (!q) notFound();
  const backLink = <Link href={`/admin/requests/${q.requestId}`} className={btnOutline}>Back to request</Link>;

  if (q.status === "DRAFT") {
    return (
      <>
        <PageHeader title="Draft quotation" subtitle={`${reqNo(q.request.number)} · ${q.request.title} · ${q.request.customer.name}`} action={backLink} />
        {saved && <p role="status" className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Draft saved. Review the preview below, then send it.</p>}
        <div className="space-y-6">
          <Card>
            <QuoteBuilder
              initial={{
                quoteId: q.id,
                requestId: q.requestId,
                scope: q.scope,
                milestones: q.milestones ?? "",
                paymentTerms: q.paymentTerms ?? "",
                validUntil: toDateInput(q.validUntil),
                discount: q.discount ? paiseToInput(q.discount) : "",
                taxRate: String(q.taxRateBp / 100),
                advancePercent: String(q.advancePercent),
                items: q.items.map((i) => ({ description: i.description, quantity: String(i.quantity), unitPrice: paiseToInput(i.unitPrice) })),
              }}
            />
          </Card>
          <div>
            <h2 className="mb-3 font-semibold text-navy">Customer preview</h2>
            <QuoteDocument q={q} />
          </div>
          <Card className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-md text-sm text-muted">Sending assigns the quotation number, locks it, and shows it to the customer. Save any edits first.</div>
            <div className="flex flex-wrap items-start gap-2">
              <form action={deleteDraftAction}>
                <input type="hidden" name="quoteId" value={q.id} />
                <button className={btnOutline}>Delete draft</button>
              </form>
              <SendQuoteButton quoteId={q.id} />
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={`Quotation ${q.number}`} subtitle={`${q.request.title} · ${q.request.customer.name}`}
        action={<div className="flex gap-2 print:hidden">{backLink}<PrintButton /></div>} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <QuoteBadge q={q} />
        {["SENT", "REVISION_REQUESTED", "DECLINED"].includes(q.status) && <ReviseQuoteButton quoteId={q.id} />}
      </div>
      <QuoteDocument q={q} />
    </>
  );
}
