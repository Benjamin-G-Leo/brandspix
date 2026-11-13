import { redirect } from "next/navigation";
import { AuthCard } from "@/components/AuthCard";
import { LoginForm } from "@/components/auth-forms";
import { getUser, isStaff } from "@/lib/session";

export default async function Page() {
  const user = await getUser();
  if (user) redirect(isStaff(user.role) ? "/admin/dashboard" : "/portal/dashboard");
  return (
    <AuthCard title="Admin sign in" subtitle="Authorised Brandspix staff only.">
      <LoginForm admin />
    </AuthCard>
  );
}
