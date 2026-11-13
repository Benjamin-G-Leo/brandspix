import Link from "next/link";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/session";
import { Card, EmptyState, PageHeader, StatusBadge, btnPrimary } from "@/components/ui";
import { fmtDate, reqNo } from "@/lib/status";

export default async function Page() {
  const user = await requireCustomer();
  const [open, awaiting, recent] = await Promise.all([
    db.serviceRequest.count({ where: { customerId: user.id, status: { notIn: ["COMPLETED", "CANCELLED"] } } }),
    db.serviceRequest.count({ where: { customerId: user.id, status: "AWAITING_CUSTOMER" } }),
    db.serviceRequest.findMany({
      where: { customerId: user.id }, orderBy: { updatedAt: "desc" }, take: 5, include: { service: true },
    }),
  ]);
  return (
    <>
      <PageHeader
        title={`Welcome, ${user.name.split(" ")[0]}`}
        subtitle="Here's what's happening with your requests."
        action={<Link href="/portal/request/new" className={btnPrimary}>New request</Link>}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card><p className="text-sm text-muted">Open requests</p><p className="mt-1 text-3xl font-semibold text-navy">{open}</p></Card>
        <Card><p className="text-sm text-muted">Waiting for your reply</p><p className="mt-1 text-3xl font-semibold text-navy">{awaiting}</p></Card>
      </div>
      <h2 className="mb-3 font-semibold text-navy">Recent activity</h2>
      {recent.length === 0 ? (
        <EmptyState title="No requests yet" hint="Browse our services and submit your first request."
          action={<Link href="/portal/services" className={btnPrimary}>Browse services</Link>} />
      ) : (
        <Card className="divide-y divide-line !p-0">
          {recent.map((r) => (
            <Link key={r.id} href={`/portal/requests/${r.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface">
              <div className="min-w-0">
                <p className="truncate font-medium text-navy">{r.title}</p>
                <p className="text-xs text-muted">{reqNo(r.number)} · {r.service.name} · {fmtDate(r.updatedAt)}</p>
              </div>
              <StatusBadge status={r.status} />
            </Link>
          ))}
        </Card>
      )}
    </>
  );
}
