import type { RequestStatus, Priority } from "@/generated/prisma/client";

export const STATUS_LABEL: Record<RequestStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  NEED_INFO: "Need More Information",
  QUOTATION_SENT: "Quotation Sent",
  AWAITING_APPROVAL: "Awaiting Approval",
  PAYMENT_PENDING: "Payment Pending",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review / Feedback",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  CANCELLED: "Cancelled",
};

export const STATUS_VALUES = Object.keys(STATUS_LABEL) as [RequestStatus, ...RequestStatus[]];

const blue = "bg-blue-50 text-blue-700 ring-blue-200";
const amber = "bg-amber-50 text-amber-700 ring-amber-200";
const green = "bg-emerald-50 text-emerald-700 ring-emerald-200";
const indigo = "bg-indigo-50 text-indigo-700 ring-indigo-200";
const grey = "bg-gray-100 text-gray-600 ring-gray-200";

export const STATUS_TONE: Record<RequestStatus, string> = {
  SUBMITTED: blue,
  UNDER_REVIEW: blue,
  NEED_INFO: amber,
  QUOTATION_SENT: indigo,
  AWAITING_APPROVAL: amber,
  PAYMENT_PENDING: amber,
  IN_PROGRESS: "bg-sky-50 text-sky-700 ring-sky-200",
  REVIEW: indigo,
  COMPLETED: green,
  ON_HOLD: grey,
  CANCELLED: grey,
};

/** Statuses where the customer is expected to act. */
export const CUSTOMER_ACTION: RequestStatus[] = ["NEED_INFO", "AWAITING_APPROVAL", "PAYMENT_PENDING", "REVIEW"];

export const PRIORITY_LABEL: Record<Priority, string> = { LOW: "Low", NORMAL: "Normal", HIGH: "High" };

export const fmtDate = (d: Date | null | undefined) =>
  d ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const reqNo = (n: number) => `REQ-${String(n).padStart(4, "0")}`;
