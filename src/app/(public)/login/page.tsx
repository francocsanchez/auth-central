import { LoginForm } from "@/app/(public)/login/login-form";
import { normalizeReturnTo } from "@/lib/auth/redirects";
import { getCentralSessionPayload } from "@/lib/auth/session";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getCentralSessionPayload();
  const params = await searchParams;
  const returnToParam = Array.isArray(params.returnTo)
    ? params.returnTo[0]
    : params.returnTo;
  const appKey = Array.isArray(params.appKey) ? params.appKey[0] : params.appKey;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const returnTo = normalizeReturnTo(returnToParam, session?.user.isCentralAdmin ? "/dashboard" : "/profile");

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.2fr_0.8fr]">
      <section className="hidden border-r bg-muted/30 lg:flex lg:flex-col lg:justify-between">
        <div className="p-10">
          <p className="text-xs font-medium uppercase tracking-[0.34em] text-muted-foreground">
            Auth Central
          </p>
        </div>
        <div className="space-y-6 p-10">
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-tight">
            Unificá usuarios, sesiones y acceso interno sin multiplicar logins.
          </h1>
          <div className="grid max-w-2xl grid-cols-3 gap-px border bg-border">
            {[
              "Usuarios centralizados",
              "Roles por aplicación",
              "SSO simple entre puertos",
            ].map((item) => (
              <div key={item} className="bg-background p-5 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-xl">
          <LoginForm appKey={appKey} returnTo={returnTo} error={error} />
        </div>
      </section>
    </div>
  );
}
