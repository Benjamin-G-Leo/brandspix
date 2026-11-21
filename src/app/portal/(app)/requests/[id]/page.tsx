import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/session";
import { Card, PageHeader, StatusBadge } from "@/components/ui";
import { ReplyForm } from "@/components/request-forms";
import { fmtDate, reqNo } from "@/lib/status";
import Link from "next/link";
import { QuoteBadge } from "@/components/quote-document";
import { formatINR } from "@/lib/money";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCustomer();
  const { id } = await params;
  const r = await db.serviceRequest.findFirst({
    where: { id, customerId: user.id },
    include: {
      service: true,
      attachments: true,
      quotations: { where: { status: { not: "DRAFT" } }, orderBy: { sentAt: "desc" } },
      notes: { where: { internal: false }, include: { author: { select: { name: true, role: true } } }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!r) notFound();
  return (
    <>
      <PageHeader title={r.title} subtitle={`${reqNo(r.number)} · ${r.service.name} · submitted ${fmtDate(r.createdAt)}`} action={<StatusBadge status={r.status} />} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <h2 className="font-semibold text-navy">Your brief</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{r.scope}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted">Budget</dt><dd>{r.budget ?? "—"}</dd></div>
              <div><dt className="text-muted">Deadline</dt><dd>{fmtDate(r.deadline)}</dd></div>
            </dl>
          </Card>
          <Card>
            <h2 className="font-semibold text-navy">Conversation</h2>
            {r.notes.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No messages yet. We&apos;ll reply here if we need more details.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {r.notes.map((n) => (
                  <li key={n.id} className="rounded-lg bg-surface p-3 text-sm">
                    <p className="text-xs text-muted">{n.author.role === "CUSTOMER" ? "You" : `${n.author.name} (Brandspix)`} · {fmtDate(n.createdAt)}</p>
                    <p className="mt-1 whitespace-pre-wrap">{n.body}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4"><ReplyForm requestId={r.id} /></div>
          </Card>
        </div>
        <div className="space-y-4">
        {r.quotations.length > 0 && (
          <Card>
            <h2 className="font-semibold text-navy">Quotations</h2>
            <ul className="mt-2 divide-y divide-line text-sm">
              {r.quotations.map((q) => (
                <li key={q.id} className="flex items-center justify-between gap-2 py-2">
                  <Link href={`/portal/quotations/${q.id}`} className="font-medium text-brand hover:underline">{q.number}</Link>
                  <span className="tabular-nums text-muted">{formatINR(q.total)}</span>
                  <QuoteBadge q={q} />
                </li>
              ))}
            </ul>
          </Card>
        )}
        <Card className="h-fit">
          <h2 className="font-semibold text-navy">Attachments</h2>
          {r.attachments.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No files attached.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {r.attachments.map((a) => (
                <li key={a.id}><a className="text-brand hover:underline" href={`/api/attachments/${a.id}`}>{a.fileName}</a> <span className="text-xs text-muted">({Math.ceil(a.size / 1024)} KB)</span></li>
              ))}
            </ul>
          )}
        </Card>
        </div>
      </div>
    </>
  );
}
