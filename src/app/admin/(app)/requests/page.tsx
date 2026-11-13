import Link from "next/link";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { Card, EmptyState, PageHeader, StatusBadge, btnOutline, inputCls } from "@/components/ui";
import { PRIORITY_LABEL, STATUS_LABEL, fmtDate, reqNo } from "@/lib/status";
import type { RequestStatus } from "@/generated/prisma/client";

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireStaff();
  const { q, status } = await searchParams;
  const validStatus = status && status in STATUS_LABEL ? (status as RequestStatus) : undefined;
  const requests = await db.serviceRequest.findMany({
    where: {
      ...(validStatus && { status: validStatus }),
      ...(q && {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { customer: { name: { contains: q, mode: "insensitive" } } },
          { customer: { businessName: { contains: q, mode: "insensitive" } } },
        ],
      }),
    },
    orderBy: [{ createdAt: "desc" }],
    include: { customer: true, service: true, assignedTo: true },
    take: 200,
  });
  return (
    <>
      <PageHeader title="Service requests" />
      <form className="mb-4 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="q">Search</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search title or customer" className={`${inputCls} !mt-0 max-w-xs`} />
        <label className="sr-only" htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={validStatus ?? ""} className={`${inputCls} !mt-0 max-w-[12rem]`}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button className={btnOutline}>Filter</button>
      </form>
      {requests.length === 0 ? (
        <EmptyState title="No requests match" />
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-3">No.</th><th className="px-5 py-3">Request</th><th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Priority</th><th className="px-5 py-3">Assigned</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-surface">
                  <td className="px-5 py-3 text-muted">{reqNo(r.number)}</td>
                  <td className="px-5 py-3"><Link href={`/admin/requests/${r.id}`} className="font-medium text-navy hover:underline">{r.title}</Link><p className="text-xs text-muted">{r.service.name}</p></td>
                  <td className="px-5 py-3">{r.customer.name}{r.customer.businessName && <p className="text-xs text-muted">{r.customer.businessName}</p>}</td>
                  <td className="px-5 py-3">{PRIORITY_LABEL[r.priority]}</td>
                  <td className="px-5 py-3">{r.assignedTo?.name ?? "—"}</td>
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
