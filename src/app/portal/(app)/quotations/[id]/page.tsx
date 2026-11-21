import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/session";
import { Card, PageHeader, btnOutline } from "@/components/ui";
import { QuoteDocument, isExpired } from "@/components/quote-document";
import { PrintButton, QuoteResponse } from "@/components/quote-actions-ui";
import { quoteDocInclude } from "@/lib/quote-query";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCustomer();
  const { id } = await params;
  const q = await db.quotation.findFirst({
    where: { id, status: { not: "DRAFT" }, request: { customerId: user.id } },
    include: quoteDocInclude,
  });
  if (!q) notFound();

  // First view by the customer: "Quotation Sent" becomes "Awaiting Approval".
  if (q.status === "SENT") {
    await db.serviceRequest.updateMany({ where: { id: q.requestId, status: "QUOTATION_SENT" }, data: { status: "AWAITING_APPROVAL" } });
  }
  const expired = isExpired(q);

  return (
    <>
      <PageHeader title={`Quotation ${q.number}`} subtitle={q.request.title}
        action={<div className="flex gap-2 print:hidden"><Link href={`/portal/requests/${q.requestId}`} className={btnOutline}>View request</Link><PrintButton /></div>} />
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2"><QuoteDocument q={q} /></div>
        <div className="print:hidden">
          {q.status === "SENT" ? (
            <Card>
              <h2 className="mb-3 font-semibold text-navy">Your response</h2>
              {expired && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">This quotation has expired. You can request an updated one.</p>}
              <QuoteResponse quoteId={q.id} expired={expired} />
            </Card>
          ) : (
            <Card>
              <h2 className="font-semibold text-navy">Status</h2>
              <p className="mt-2 text-sm text-muted">
                {{
                  ACCEPTED: "You accepted this quotation. We'll be in touch about payment and next steps.",
                  REVISION_REQUESTED: "You asked for changes. We'll send an updated quotation.",
                  DECLINED: "You declined this quotation.",
                  SUPERSEDED: "This quotation has been replaced by a newer one.",
                  DRAFT: "",
                  SENT: "",
                }[q.status]}
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
