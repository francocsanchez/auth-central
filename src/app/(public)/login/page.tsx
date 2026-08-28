import { LoginForm } from "@/app/(public)/login/login-form";
import { listActiveApplications } from "@/lib/access/repository";
import { normalizeReturnTo } from "@/lib/auth/redirects";
import { getEnv } from "@/lib/env";
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
  const requestedReturnTo = returnToParam ? returnTo : undefined;
  const applications = await listActiveApplications();
  const env = getEnv();
  const applicationOptions = [
    {
      key: "auth-central",
      name: "Auth Central",
      url: new URL("/profile", env.AUTH_BASE_URL).toString(),
    },
    ...applications
    .filter((application) => Boolean(application.url))
    .map((application) => ({
      key: application.key,
      name: application.name,
      url: application.url as string,
    })),
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <LoginForm
          appKey={appKey}
          returnTo={requestedReturnTo}
          error={error}
          applications={applicationOptions}
        />
      </div>
    </div>
  );
}
