import type { RequestStatus, Priority } from "@/generated/prisma/client";

export const STATUS_LABEL: Record<RequestStatus, string> = {
  NEW: "New",
  UNDER_REVIEW: "Under Review",
  QUOTED: "Quoted",
  APPROVED: "Approved",
  IN_PROGRESS: "In Progress",
  AWAITING_CUSTOMER: "Awaiting Customer",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const STATUS_TONE: Record<RequestStatus, string> = {
  NEW: "bg-blue-50 text-blue-700 ring-blue-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 ring-amber-200",
  QUOTED: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  IN_PROGRESS: "bg-sky-50 text-sky-700 ring-sky-200",
  AWAITING_CUSTOMER: "bg-amber-50 text-amber-700 ring-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-gray-100 text-gray-600 ring-gray-200",
};

export const PRIORITY_LABEL: Record<Priority, string> = { LOW: "Low", NORMAL: "Normal", HIGH: "High" };

export const fmtDate = (d: Date | null | undefined) =>
  d ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const reqNo = (n: number) => `REQ-${String(n).padStart(4, "0")}`;
