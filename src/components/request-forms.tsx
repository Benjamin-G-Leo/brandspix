"use client";

import { useActionState } from "react";
import {
  createRequestAction,
  customerReplyAction,
  staffNoteAction,
  updateRequestAction,
} from "@/lib/request-actions";
import type { FormState } from "@/lib/auth-actions";
import { btnPrimary, inputCls } from "@/components/ui";
import { STATUS_LABEL, PRIORITY_LABEL } from "@/lib/status";

function Feedback({ state }: { state: FormState }) {
  return (
    <>
      {state?.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.message && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.message}</p>}
    </>
  );
}

export function NewRequestForm({
  services, defaultServiceId,
}: { services: { id: string; name: string }[]; defaultServiceId?: string }) {
  const [state, action, pending] = useActionState(createRequestAction, undefined);
  const f = state?.fields ?? {};
  return (
    <form action={action} className="space-y-4">
      <Feedback state={state} />
      <div>
        <label htmlFor="serviceId" className="text-sm font-medium text-navy">Service</label>
        <select id="serviceId" name="serviceId" required className={inputCls} defaultValue={f.serviceId ?? defaultServiceId ?? ""}>
          <option value="" disabled>Select a service</option>
          {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="title" className="text-sm font-medium text-navy">Request title</label>
        <input id="title" name="title" required minLength={5} maxLength={120} defaultValue={f.title ?? ""} className={inputCls} placeholder="e.g. Corporate website redesign" />
      </div>
      <div>
        <label htmlFor="scope" className="text-sm font-medium text-navy">Project scope</label>
        <textarea id="scope" name="scope" required minLength={20} maxLength={5000} rows={6} defaultValue={f.scope ?? ""} className={inputCls} aria-describedby="scope-hint" />
        <p id="scope-hint" className="mt-1 text-xs text-muted">What do you need, who is it for, and what does success look like?</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="budget" className="text-sm font-medium text-navy">Budget (optional)</label>
          <input id="budget" name="budget" defaultValue={f.budget ?? ""} className={inputCls} placeholder="e.g. ₹50,000 – ₹80,000" />
        </div>
        <div>
          <label htmlFor="deadline" className="text-sm font-medium text-navy">Target deadline (optional)</label>
          <input id="deadline" name="deadline" type="date" defaultValue={f.deadline ?? ""} className={inputCls} />
        </div>
      </div>
      <div>
        <label htmlFor="files" className="text-sm font-medium text-navy">Attachments (optional)</label>
        <input id="files" name="files" type="file" multiple className={`${inputCls} file:mr-3 file:rounded file:border-0 file:bg-surface file:px-3 file:py-1`} aria-describedby="files-hint" />
        <p id="files-hint" className="mt-1 text-xs text-muted">Up to 5 files, 10 MB each. PDF, PNG, JPG, DOCX, XLSX, TXT or ZIP.</p>
      </div>
      <button className={btnPrimary} disabled={pending}>{pending ? "Submitting…" : "Submit request"}</button>
    </form>
  );
}

export function ReplyForm({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState(customerReplyAction, undefined);
  return (
    <form action={action} key={state?.message} className="space-y-3">
      <Feedback state={state} />
      <input type="hidden" name="requestId" value={requestId} />
      <label htmlFor="body" className="sr-only">Message</label>
      <textarea id="body" name="body" rows={3} required maxLength={3000} className={inputCls} placeholder="Write a message to the Brandspix team…" />
      <button className={btnPrimary} disabled={pending}>{pending ? "Sending…" : "Send message"}</button>
    </form>
  );
}

export function AdminUpdateForm({
  request, staff,
}: {
  request: { id: string; status: string; priority: string; assignedToId: string | null };
  staff: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(updateRequestAction, undefined);
  return (
    <form action={action} key={`${request.status}|${request.priority}|${request.assignedToId}`} className="space-y-3">
      <Feedback state={state} />
      <input type="hidden" name="requestId" value={request.id} />
      <div>
        <label htmlFor="status" className="text-sm font-medium text-navy">Status</label>
        <select id="status" name="status" defaultValue={request.status} className={inputCls}>
          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="priority" className="text-sm font-medium text-navy">Priority</label>
        <select id="priority" name="priority" defaultValue={request.priority} className={inputCls}>
          {Object.entries(PRIORITY_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="assignedToId" className="text-sm font-medium text-navy">Assigned to</label>
        <select id="assignedToId" name="assignedToId" defaultValue={request.assignedToId ?? ""} className={inputCls}>
          <option value="">Unassigned</option>
          {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <button className={btnPrimary} disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
    </form>
  );
}

export function StaffNoteForm({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState(staffNoteAction, undefined);
  return (
    <form action={action} key={state?.message} className="space-y-3">
      <Feedback state={state} />
      <input type="hidden" name="requestId" value={requestId} />
      <label htmlFor="note" className="sr-only">Note or message</label>
      <textarea id="note" name="body" rows={3} required maxLength={3000} className={inputCls} placeholder="Write a note or a question for the customer…" />
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" name="internal" defaultChecked /> Internal note (hidden from customer)
      </label>
      <button className={btnPrimary} disabled={pending}>{pending ? "Saving…" : "Post"}</button>
    </form>
  );
}
