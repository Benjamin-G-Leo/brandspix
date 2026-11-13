import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { Card, PageHeader, StatusBadge } from "@/components/ui";
import { AdminUpdateForm, StaffNoteForm } from "@/components/request-forms";
import { fmtDate, reqNo } from "@/lib/status";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const [r, staff] = await Promise.all([
    db.serviceRequest.findUnique({
      where: { id },
      include: {
        customer: true, service: true, attachments: true,
        notes: { include: { author: { select: { name: true, role: true } } }, orderBy: { createdAt: "asc" } },
      },
    }),
    db.user.findMany({ where: { role: { in: ["ADMIN", "STAFF"] }, active: true }, select: { id: true, name: true } }),
  ]);
  if (!r) notFound();
  return (
    <>
      <PageHeader title={r.title} subtitle={`${reqNo(r.number)} · ${r.service.name} · ${fmtDate(r.createdAt)}`} action={<StatusBadge status={r.status} />} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <h2 className="font-semibold text-navy">Customer brief</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{r.scope}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted">Budget</dt><dd>{r.budget ?? "—"}</dd></div>
              <div><dt className="text-muted">Deadline</dt><dd>{fmtDate(r.deadline)}</dd></div>
            </dl>
          </Card>
          <Card>
            <h2 className="font-semibold text-navy">Notes &amp; conversation</h2>
            <ul className="mt-3 space-y-3">
              {r.notes.length === 0 && <li className="text-sm text-muted">Nothing yet.</li>}
              {r.notes.map((n) => (
                <li key={n.id} className={`rounded-lg p-3 text-sm ${n.internal ? "bg-amber-50" : "bg-surface"}`}>
                  <p className="text-xs text-muted">
                    {n.author.name} · {fmtDate(n.createdAt)} · {n.internal ? "Internal" : n.author.role === "CUSTOMER" ? "Customer" : "Sent to customer"}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap">{n.body}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4"><StaffNoteForm requestId={r.id} /></div>
          </Card>
        </div>
        <div className="space-y-4">
          <Card><h2 className="mb-3 font-semibold text-navy">Manage</h2><AdminUpdateForm request={r} staff={staff} /></Card>
          <Card>
            <h2 className="font-semibold text-navy">Customer</h2>
            <p className="mt-2 text-sm">{r.customer.name}</p>
            {r.customer.businessName && <p className="text-sm text-muted">{r.customer.businessName}</p>}
            <p className="text-sm">{r.customer.email}</p>
            <p className="text-sm">{r.customer.mobile}</p>
          </Card>
          <Card>
            <h2 className="font-semibold text-navy">Attachments</h2>
            {r.attachments.length === 0 ? <p className="mt-2 text-sm text-muted">None.</p> : (
              <ul className="mt-2 space-y-1 text-sm">
                {r.attachments.map((a) => <li key={a.id}><a className="text-brand hover:underline" href={`/api/attachments/${a.id}`}>{a.fileName}</a></li>)}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
