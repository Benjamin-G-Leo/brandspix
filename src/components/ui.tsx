import type { RequestStatus } from "@/generated/prisma/client";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/status";

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_TONE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line bg-white p-5 ${className}`}>{children}</div>;
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-navy">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-white px-6 py-12 text-center">
      <p className="font-medium text-navy">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export const inputCls =
  "mt-1 block w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
export const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60";
export const btnOutline =
  "inline-flex items-center justify-center rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-surface";
