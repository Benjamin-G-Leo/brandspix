import { AuthCard } from "@/components/AuthCard";
import { ResetForm } from "@/components/auth-forms";

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <AuthCard title="Set a new password">
      {token ? <ResetForm token={token} /> : <p className="text-sm text-red-700">This reset link is invalid.</p>}
    </AuthCard>
  );
}
