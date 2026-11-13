import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/session";
import { Card, PageHeader } from "@/components/ui";
import { NewRequestForm } from "@/components/request-forms";

export default async function Page({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  await requireCustomer();
  const { service } = await searchParams;
  const services = await db.service.findMany({
    where: { active: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true },
  });
  return (
    <>
      <PageHeader title="New service request" subtitle="Tell us what you need and we'll come back with a quotation." />
      <Card className="max-w-2xl">
        <NewRequestForm services={services} defaultServiceId={service} />
      </Card>
    </>
  );
}
