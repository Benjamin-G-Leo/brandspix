import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { LoginForm } from "@/components/auth-forms";
import { getUser, isStaff } from "@/lib/session";

export default async function Page({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const user = await getUser();
  if (user) redirect(isStaff(user.role) ? "/admin/dashboard" : "/portal/dashboard");
  const { reset } = await searchParams;
  return (
    <AuthCard
      title="Sign in to your portal"
      subtitle="Request services, approve quotations and track your projects."
      footer={<>New to Brandspix? <Link href="/portal/register" className="font-medium text-brand">Create an account</Link></>}
    >
      <LoginForm notice={reset ? "Password updated. Please sign in." : undefined} />
    </AuthCard>
  );
}
