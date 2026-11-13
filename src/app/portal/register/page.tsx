import Link from "next/link";
import { AuthCard } from "@/components/AuthCard";
import { RegisterForm } from "@/components/auth-forms";

export default function Page() {
  return (
    <AuthCard
      title="Create your account"
      footer={<>Already registered? <Link href="/portal/login" className="font-medium text-brand">Sign in</Link></>}
    >
      <RegisterForm />
    </AuthCard>
  );
}
