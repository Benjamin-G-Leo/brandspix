import Link from "next/link";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/session";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { QuoteBadge } from "@/components/quote-document";
import { formatINR } from "@/lib/money";
import { fmtDate } from "@/lib/status";

export default async function Page() {
  const user = await requireCustomer();
  const quotes = await db.quotation.findMany({
    where: { request: { customerId: user.id }, status: { not: "DRAFT" } },
    orderBy: { sentAt: "desc" },
    include: { request: true },
  });
  return (
    <>
      <PageHeader title="Quotations" subtitle="Review, accept or request changes to your quotations." />
      {quotes.length === 0 ? (
        <EmptyState title="No quotations yet" hint="When we send a quotation for one of your requests, it will appear here." />
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase text-muted">
              <tr><th className="px-5 py-3">Number</th><th className="px-5 py-3">Request</th><th className="px-5 py-3 text-right">Total</th><th className="px-5 py-3">Valid until</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-surface">
                  <td className="px-5 py-3"><Link href={`/portal/quotations/${q.id}`} className="font-medium text-navy hover:underline">{q.number}</Link></td>
                  <td className="px-5 py-3">{q.request.title}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatINR(q.total)}</td>
                  <td className="px-5 py-3">{fmtDate(q.validUntil)}</td>
                  <td className="px-5 py-3"><QuoteBadge q={q} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
