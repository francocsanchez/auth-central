import { redirect } from "next/navigation";

import { getCentralSessionPayload } from "@/lib/auth/session";

export default async function HomePage() {
  const session = await getCentralSessionPayload();

  if (!session) {
    redirect("/login");
  }

  if (session.user.isCentralAdmin) {
    redirect("/dashboard");
  }

  redirect("/profile");
}
