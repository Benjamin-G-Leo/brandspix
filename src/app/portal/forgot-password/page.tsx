import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { ForgotForm } from "@/components/auth-forms";

export default function Page() {
  return (
    <AuthCard
      title="Forgot password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={<Link href="/portal/login" className="font-medium text-brand">Back to sign in</Link>}
    >
      <ForgotForm />
    </AuthCard>
  );
}
