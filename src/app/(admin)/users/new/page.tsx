import { KeyRound, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";

import { FlashAlert } from "@/components/feedback/flash-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUserAction } from "@/features/users/actions";
import { listApplications } from "@/lib/access/repository";
import { cn } from "@/lib/utils";
import { requireCentralAdminSession } from "@/lib/auth/session";

type NewUserPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewUserPage({ searchParams }: NewUserPageProps) {
  await requireCentralAdminSession();
  const applications = await listApplications();
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-muted/30 p-0">
      <Dialog open>
        <DialogContent
          className="top-2 right-2 bottom-2 left-2 max-h-none w-auto max-w-none translate-x-0 translate-y-0 overflow-y-auto p-0 sm:max-w-none"
          showCloseButton={false}
        >
          <div className="border-b p-3">
            <DialogHeader className="gap-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                Usuarios
              </p>
              <DialogTitle>Crear usuario central</DialogTitle>
              <DialogDescription>
                Alta compacta para identidad, seguridad inicial y accesos por aplicación.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-3 p-3">
            <FlashAlert
              success={Array.isArray(params.success) ? params.success[0] : params.success}
              error={Array.isArray(params.error) ? params.error[0] : params.error}
            />

            <div className="grid gap-px border bg-border sm:grid-cols-3">
              <div className="space-y-1 bg-background p-2.5">
                <UserRound className="size-4 text-primary" />
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Identidad
                </p>
                <p className="text-sm text-muted-foreground">Nombre y correo de uso diario.</p>
              </div>
              <div className="space-y-1 bg-background p-2.5">
                <KeyRound className="size-4 text-primary" />
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Seguridad
                </p>
                <p className="text-sm text-muted-foreground">Contraseña inicial y estado.</p>
              </div>
              <div className="space-y-1 bg-background p-2.5">
                <ShieldCheck className="size-4 text-primary" />
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  Accesos
                </p>
                <p className="text-sm text-muted-foreground">Permisos por aplicación.</p>
              </div>
            </div>

            <form action={createUserAction} className="space-y-4">
              <Card className="border bg-card">
                <CardHeader className="border-b">
                  <CardTitle>Base de la cuenta</CardTitle>
                  <CardDescription>Campos esenciales para dejar la cuenta lista.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 pt-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" name="name" required placeholder="Nombre y apellido" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required placeholder="persona@empresa.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña inicial</Label>
                    <Input id="password" name="password" type="password" minLength={8} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Rol central</Label>
                    <Select name="centralRole" defaultValue="user">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="admin">Admin central</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <label className="flex items-center gap-3 border bg-muted/20 px-3 py-2 text-sm">
                    <input defaultChecked name="isActive" type="checkbox" className="mt-0.5" />
                    <span>Crear usuario activo</span>
                  </label>
                </CardContent>
              </Card>

              <Card className="border bg-card">
                <CardHeader className="border-b">
                  <CardTitle>Acceso por aplicación</CardTitle>
                  <CardDescription>Marcá solo lo que necesita desde el arranque.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-3">
                  {applications.length ? (
                    <div className="grid gap-px border bg-border">
                      {applications.map((application) => (
                        <div
                          key={application.key}
                          className="grid gap-px bg-border lg:grid-cols-[minmax(0,1fr)_160px]"
                        >
                          <label className="flex items-center gap-3 bg-background px-3 py-2.5 text-sm">
                            <input
                              name={`app:${application.key}:enabled`}
                              type="checkbox"
                              value="on"
                              className="mt-0.5"
                            />
                            <span className="min-w-0">
                              <span className="block font-medium">{application.name}</span>
                              <span className="block font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                                {application.key}
                              </span>
                            </span>
                          </label>
                          <div className="bg-background p-2">
                            <Select name={`app:${application.key}:role`} defaultValue="user">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">admin</SelectItem>
                                <SelectItem value="user">user</SelectItem>
                                <SelectItem value="viewer">viewer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Primero creá al menos una aplicación para poder asignar accesos.
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-col-reverse gap-2 border-t p-3 pt-0 sm:flex-row sm:justify-end">
                <Link href="/users" className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}>
                  Cancelar
                </Link>
                <SubmitButton className="w-full sm:w-auto" pendingLabel="Creando usuario...">
                  Crear usuario
                </SubmitButton>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
