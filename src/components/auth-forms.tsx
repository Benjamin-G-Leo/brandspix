"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  adminLoginAction,
  customerLoginAction,
  forgotPasswordAction,
  registerAction,
  resetPasswordAction,
  type FormState,
} from "@/lib/auth-actions";
import { btnPrimary, inputCls } from "@/components/ui";

type Action = (s: FormState, fd: FormData) => Promise<FormState>;

function Field({
  label, name, type = "text", state, autoComplete, required = true, hint,
}: {
  label: string; name: string; type?: string; state: FormState; autoComplete?: string; required?: boolean; hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-navy">{label}</label>
      <input
        id={name} name={name} type={type} required={required} autoComplete={autoComplete}
        defaultValue={type === "password" ? "" : state?.fields?.[name] ?? ""}
        aria-describedby={hint ? `${name}-hint` : undefined}
        className={inputCls}
      />
      {hint && <p id={`${name}-hint`} className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function FormShell({
  action, submit, children,
}: {
  action: Action; submit: string; children: (state: FormState) => React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-4" noValidate={false}>
      {state?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state?.message && (
        <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.message}</p>
      )}
      {children(state)}
      <button className={`${btnPrimary} w-full`} disabled={pending}>{pending ? "Please wait…" : submit}</button>
    </form>
  );
}

export function LoginForm({ admin = false, notice }: { admin?: boolean; notice?: string }) {
  return (
    <>
      {notice && <p role="status" className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>}
      <FormShell action={admin ? adminLoginAction : customerLoginAction} submit="Sign in">
        {(s) => (
          <>
            <Field label="Email" name="email" type="email" state={s} autoComplete="username" />
            <Field label="Password" name="password" type="password" state={s} autoComplete="current-password" />
            {!admin && (
              <div className="text-right text-sm">
                <Link href="/portal/forgot-password" className="text-brand hover:underline">Forgot password?</Link>
              </div>
            )}
          </>
        )}
      </FormShell>
    </>
  );
}

export function RegisterForm() {
  return (
    <FormShell action={registerAction} submit="Create account">
      {(s) => (
        <>
          <Field label="Full name" name="name" state={s} autoComplete="name" />
          <Field label="Business name" name="businessName" state={s} required={false} autoComplete="organization" />
          <Field label="Email" name="email" type="email" state={s} autoComplete="email" />
          <Field label="Mobile" name="mobile" type="tel" state={s} autoComplete="tel" />
          <Field label="Password" name="password" type="password" state={s} autoComplete="new-password" hint="At least 8 characters." />
        </>
      )}
    </FormShell>
  );
}

export function ForgotForm() {
  return (
    <FormShell action={forgotPasswordAction} submit="Send reset link">
      {(s) => <Field label="Email" name="email" type="email" state={s} autoComplete="email" />}
    </FormShell>
  );
}

export function ResetForm({ token }: { token: string }) {
  return (
    <FormShell action={resetPasswordAction} submit="Set new password">
      {(s) => (
        <>
          <input type="hidden" name="token" value={token} />
          <Field label="New password" name="password" type="password" state={s} autoComplete="new-password" hint="At least 8 characters." />
        </>
      )}
    </FormShell>
  );
}
