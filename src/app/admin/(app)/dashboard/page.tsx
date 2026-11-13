import Link from "next/link";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { Card, PageHeader, StatusBadge } from "@/components/ui";
import { fmtDate, reqNo } from "@/lib/status";

export default async function Page() {
  await requireStaff();
  const [customers, newReqs, active, recent] = await Promise.all([
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.serviceRequest.count({ where: { status: "NEW" } }),
    db.serviceRequest.count({ where: { status: { in: ["UNDER_REVIEW", "QUOTED", "APPROVED", "IN_PROGRESS", "AWAITING_CUSTOMER"] } } }),
    db.serviceRequest.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { customer: true, service: true } }),
  ]);
  const kpis = [["Customers", customers], ["New requests", newReqs], ["Requests in progress", active]] as const;
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Revenue and payment KPIs arrive with the billing phase." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {kpis.map(([label, n]) => (
          <Card key={label}><p className="text-sm text-muted">{label}</p><p className="mt-1 text-3xl font-semibold text-navy">{n}</p></Card>
        ))}
      </div>
      <h2 className="mb-3 font-semibold text-navy">Latest requests</h2>
      <Card className="divide-y divide-line !p-0">
        {recent.length === 0 && <p className="px-5 py-6 text-sm text-muted">No requests yet.</p>}
        {recent.map((r) => (
          <Link key={r.id} href={`/admin/requests/${r.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface">
            <div className="min-w-0">
              <p className="truncate font-medium text-navy">{r.title}</p>
              <p className="text-xs text-muted">{reqNo(r.number)} · {r.customer.name} · {r.service.name} · {fmtDate(r.createdAt)}</p>
            </div>
            <StatusBadge status={r.status} />
          </Link>
        ))}
      </Card>
    </>
  );
}
