import Link from "next/link";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { QuoteBadge } from "@/components/quote-document";
import { formatINR } from "@/lib/money";
import { fmtDate } from "@/lib/status";

export default async function Page() {
  await requireStaff();
  const quotes = await db.quotation.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: { request: { include: { customer: true } } },
  });
  return (
    <>
      <PageHeader title="Quotations" subtitle="Create a quotation from a service request." />
      {quotes.length === 0 ? (
        <EmptyState title="No quotations yet" hint="Open a service request and choose “Create quotation”." />
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase text-muted">
              <tr><th className="px-5 py-3">Number</th><th className="px-5 py-3">Request</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3 text-right">Total</th><th className="px-5 py-3">Updated</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-surface">
                  <td className="px-5 py-3"><Link href={`/admin/quotations/${q.id}`} className="font-medium text-navy hover:underline">{q.number ?? "Draft"}</Link></td>
                  <td className="px-5 py-3">{q.request.title}</td>
                  <td className="px-5 py-3">{q.request.customer.name}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatINR(q.total)}</td>
                  <td className="px-5 py-3">{fmtDate(q.updatedAt)}</td>
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
