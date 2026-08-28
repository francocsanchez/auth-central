"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type NavigationItem = {
  href: string;
  label: string;
};

type PanelShellProps = {
  children: React.ReactNode;
  navigation: NavigationItem[];
  user: {
    name: string | null;
    email: string;
    isCentralAdmin: boolean;
  };
};

export function PanelShell({
  children,
  navigation,
  user,
}: PanelShellProps) {
  const currentPath = usePathname();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="grid min-h-screen w-full grid-cols-1 gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-r bg-background">
          <div className="flex h-full flex-col">
            <div className="space-y-3 border-b p-6">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Nippon Car
                </p>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Auth Central
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Identidad centralizada para IntraNIC, NFC y futuros proyectos internos.
              </p>
            </div>

            <nav className="flex-1 space-y-1 p-4">
              {navigation.map((item) => {
                const active =
                  currentPath === item.href ||
                  (item.href !== "/dashboard" && currentPath.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    className={cn(
                      "flex items-center justify-between border px-4 py-3 text-sm font-medium transition-colors",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-transparent text-foreground hover:border-border hover:bg-muted",
                    )}
                  >
                    <span>{item.label}</span>
                    {item.href === "/profile" && !user.isCentralAdmin ? (
                      <Badge variant="secondary">Cuenta</Badge>
                    ) : null}
                  </Link>
                );
              })}
            </nav>

            <Separator />

            <div className="space-y-4 p-4">
              <div className="space-y-1 text-sm">
                <p className="font-medium">{user.name ?? "Usuario autenticado"}</p>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href="/profile"
                  prefetch={false}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Ver perfil
                </Link>
                <Link
                  href="/logout?returnTo=/login"
                  className={buttonVariants({ variant: "secondary" })}
                >
                  Cerrar sesión
                </Link>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
