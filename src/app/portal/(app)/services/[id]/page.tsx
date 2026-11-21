import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/session";
import { Card, PageHeader, btnPrimary } from "@/components/ui";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  await requireCustomer();
  const { id } = await params;
  const s = await db.service.findFirst({ where: { id, active: true } });
  if (!s) notFound();
  return (
    <>
      <PageHeader
        title={s.name}
        subtitle={s.summary}
        action={<Link href={`/portal/request/new?service=${s.id}`} className={btnPrimary}>Request this service</Link>}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2"><h2 className="font-semibold text-navy">About</h2><p className="mt-2 text-sm leading-6">{s.description}</p></Card>
        <Card>
          <h2 className="font-semibold text-navy">Indicative pricing</h2>
          <p className="mt-2 text-2xl font-semibold text-navy">{s.priceFrom ? `From ₹${s.priceFrom.toLocaleString("en-IN")}` : "Price on request"}</p>
          <p className="mt-1 text-xs text-muted">Final pricing is confirmed in your quotation.</p>
        </Card>
        <Card>
          <h2 className="font-semibold text-navy">Deliverables</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{s.deliverables.map((d) => <li key={d}>{d}</li>)}</ul>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="font-semibold text-navy">Our process</h2>
          <ol className="mt-2 flex flex-wrap gap-2 text-sm">
            {s.process.map((p, i) => (
              <li key={p} className="rounded-full bg-surface px-3 py-1"><span className="text-muted">{i + 1}.</span> {p}</li>
            ))}
          </ol>
        </Card>
      </div>
    </>
  );
}
