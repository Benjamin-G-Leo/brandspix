"use client";

import { useActionState, useState } from "react";
import { respondQuoteAction, reviseQuoteAction, sendQuoteAction } from "@/lib/quote-actions";
import type { FormState } from "@/lib/auth-actions";
import { btnOutline, btnPrimary, inputCls } from "@/components/ui";

function Feedback({ state }: { state: FormState }) {
  return (
    <>
      {state?.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.message && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.message}</p>}
    </>
  );
}

export function PrintButton() {
  return <button type="button" onClick={() => window.print()} className={`${btnOutline} print:hidden`}>Print / save as PDF</button>;
}

export function SendQuoteButton({ quoteId }: { quoteId: string }) {
  const [state, action, pending] = useActionState(sendQuoteAction, undefined);
  return (
    <form action={action} className="space-y-2" onSubmit={(e) => { if (!confirm("Send this quotation to the customer? It can't be edited after sending.")) e.preventDefault(); }}>
      <Feedback state={state} />
      <input type="hidden" name="quoteId" value={quoteId} />
      <button className={btnPrimary} disabled={pending}>{pending ? "Sending…" : "Send to customer"}</button>
    </form>
  );
}

export function ReviseQuoteButton({ quoteId }: { quoteId: string }) {
  const [state, action, pending] = useActionState(reviseQuoteAction, undefined);
  return (
    <form action={action} className="space-y-2">
      <Feedback state={state} />
      <input type="hidden" name="quoteId" value={quoteId} />
      <button className={btnPrimary} disabled={pending}>{pending ? "Creating…" : "Create revised quotation"}</button>
    </form>
  );
}

export function QuoteResponse({ quoteId, expired }: { quoteId: string; expired: boolean }) {
  const [state, action, pending] = useActionState(respondQuoteAction, undefined);
  const [mode, setMode] = useState<"accept" | "revise" | "decline">(expired ? "revise" : "accept");
  if (state?.message) return <Feedback state={state} />;
  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Your response" className="flex flex-wrap gap-2">
        {(["accept", "revise", "decline"] as const).map((m) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} disabled={m === "accept" && expired}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ring-inset ${mode === m ? "bg-navy text-white ring-navy" : "bg-white text-navy ring-line hover:bg-surface"} disabled:opacity-40`}>
            {{ accept: "Accept", revise: "Request changes", decline: "Decline" }[m]}
          </button>
        ))}
      </div>
      <form action={action} className="space-y-3">
        <Feedback state={state} />
        <input type="hidden" name="quoteId" value={quoteId} />
        <input type="hidden" name="decision" value={mode} />
        {mode === "accept" ? (
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="agree" required className="mt-1" />
            <span>I accept the scope of work, price and terms in this quotation.</span>
          </label>
        ) : (
          <div>
            <label htmlFor="note" className="text-sm font-medium text-navy">
              {mode === "revise" ? "What would you like changed?" : "Reason (optional)"}
            </label>
            <textarea id="note" name="note" rows={3} required={mode === "revise"} maxLength={2000} className={inputCls} />
          </div>
        )}
        <button className={mode === "decline" ? btnOutline : btnPrimary} disabled={pending}>
          {pending ? "Sending…" : { accept: "Accept quotation", revise: "Send change request", decline: "Decline quotation" }[mode]}
        </button>
      </form>
    </div>
  );
}
