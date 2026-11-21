import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { Card, PageHeader } from "@/components/ui";
import { QuoteBuilder } from "@/components/quote-builder";
import { QUOTE_DEFAULTS } from "@/lib/business";
import { defaultValidUntil } from "@/lib/quote-query";
import { reqNo } from "@/lib/status";

export default async function Page({ searchParams }: { searchParams: Promise<{ request?: string }> }) {
  await requireStaff();
  const { request: requestId } = await searchParams;
  const req = requestId ? await db.serviceRequest.findUnique({ where: { id: requestId }, include: { customer: true, service: true } }) : null;
  if (!req) notFound();
  return (
    <>
      <PageHeader title="New quotation" subtitle={`${reqNo(req.number)} · ${req.title} · ${req.customer.name}`} />
      <Card>
        <QuoteBuilder
          initial={{
            requestId: req.id,
            scope: req.scope,
            milestones: "",
            paymentTerms: "",
            validUntil: defaultValidUntil(QUOTE_DEFAULTS.validityDays),
            discount: "",
            taxRate: String(QUOTE_DEFAULTS.taxRatePercent),
            advancePercent: String(QUOTE_DEFAULTS.advancePercent),
            items: [{ description: req.service.name, quantity: "1", unitPrice: "" }],
          }}
        />
      </Card>
    </>
  );
}
