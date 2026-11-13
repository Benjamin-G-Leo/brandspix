import Link from "next/link";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/session";
import { Card, EmptyState, PageHeader, StatusBadge, btnOutline, btnPrimary, inputCls } from "@/components/ui";
import { STATUS_LABEL, fmtDate, reqNo } from "@/lib/status";
import type { RequestStatus } from "@/generated/prisma/client";

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const user = await requireCustomer();
  const { q, status } = await searchParams;
  const validStatus = status && status in STATUS_LABEL ? (status as RequestStatus) : undefined;
  const requests = await db.serviceRequest.findMany({
    where: {
      customerId: user.id,
      ...(validStatus && { status: validStatus }),
      ...(q && { title: { contains: q, mode: "insensitive" } }),
    },
    orderBy: { createdAt: "desc" },
    include: { service: true },
  });
  return (
    <>
      <PageHeader title="My requests" action={<Link href="/portal/request/new" className={btnPrimary}>New request</Link>} />
      <form className="mb-4 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="q">Search</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search by title" className={`${inputCls} !mt-0 max-w-xs`} />
        <label className="sr-only" htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={validStatus ?? ""} className={`${inputCls} !mt-0 max-w-[12rem]`}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button className={btnOutline}>Filter</button>
      </form>
      {requests.length === 0 ? (
        <EmptyState title="No requests found" hint={q || validStatus ? "Try clearing your filters." : "Submit your first request to get started."} />
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase text-muted">
              <tr><th className="px-5 py-3">No.</th><th className="px-5 py-3">Title</th><th className="px-5 py-3">Service</th><th className="px-5 py-3">Submitted</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-surface">
                  <td className="px-5 py-3 text-muted">{reqNo(r.number)}</td>
                  <td className="px-5 py-3 font-medium"><Link href={`/portal/requests/${r.id}`} className="text-navy hover:underline">{r.title}</Link></td>
                  <td className="px-5 py-3">{r.service.name}</td>
                  <td className="px-5 py-3">{fmtDate(r.createdAt)}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
