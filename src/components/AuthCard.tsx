import Image from "next/image";

export function AuthCard({ title, subtitle, children, footer }: {
  title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Image src="/brand/logo.png" alt="Brandspix" width={145} height={42} priority className="mx-auto mb-6" />
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold text-navy">{title}</h1>
          {subtitle && <p className="mt-1 mb-5 text-sm text-muted">{subtitle}</p>}
          {!subtitle && <div className="mb-5" />}
          {children}
        </div>
        {footer && <p className="mt-4 text-center text-sm text-muted">{footer}</p>}
      </div>
    </div>
  );
}
