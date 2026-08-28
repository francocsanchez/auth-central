import { PanelShell } from "@/components/layout/panel-shell";
import { requireSession } from "@/lib/auth/session";

const adminNavigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/users", label: "Usuarios" },
  { href: "/applications", label: "Aplicaciones" },
  { href: "/profile", label: "Perfil" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const navigation = session.user.isCentralAdmin
    ? adminNavigation
    : adminNavigation.filter((item) => item.href === "/applications" || item.href === "/profile");

  return (
    <PanelShell navigation={navigation} user={session.user}>
      {children}
    </PanelShell>
  );
}
