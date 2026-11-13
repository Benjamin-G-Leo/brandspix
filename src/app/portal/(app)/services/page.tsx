import Link from "next/link";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/session";
import { Card, PageHeader, btnOutline, btnPrimary } from "@/components/ui";

export default async function Page() {
  await requireCustomer();
  const services = await db.service.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  return (
    <>
      <PageHeader title="Services" subtitle="Choose a service to see details or start a request." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((s) => (
          <Card key={s.id} className="flex flex-col">
            <h2 className="font-semibold text-navy">{s.name}</h2>
            <p className="mt-1 flex-1 text-sm text-muted">{s.summary}</p>
            {s.priceFrom && <p className="mt-3 text-sm text-ink">From ₹{s.priceFrom.toLocaleString("en-IN")}</p>}
            <div className="mt-4 flex gap-2">
              <Link href={`/portal/services/${s.id}`} className={btnOutline}>Details</Link>
              <Link href={`/portal/request/new?service=${s.id}`} className={btnPrimary}>Request</Link>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
