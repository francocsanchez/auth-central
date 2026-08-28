import Link from "next/link";

import { FlashAlert } from "@/components/feedback/flash-alert";
import { SubmitButton } from "@/components/forms/submit-button";
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
    <div className="space-y-4 p-3 lg:p-4">
      <div className="flex flex-col gap-2 border-b pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Usuarios
          </p>
          <h1 className="text-xl font-semibold tracking-tight">Crear usuario central</h1>
          <p className="text-sm text-muted-foreground">
            Alta compacta para identidad, seguridad inicial y accesos.
          </p>
        </div>
        <Link href="/users" className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}>
          Cancelar
        </Link>
      </div>

      <FlashAlert
        success={Array.isArray(params.success) ? params.success[0] : params.success}
        error={Array.isArray(params.error) ? params.error[0] : params.error}
      />

      <form action={createUserAction} className="space-y-3">
        <div className="grid gap-2 border bg-background p-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_180px_140px]">
          <div className="space-y-1">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" required placeholder="Nombre y apellido" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required placeholder="persona@empresa.com" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Contraseña inicial</Label>
            <Input id="password" name="password" type="password" minLength={8} required />
          </div>
          <div className="space-y-1">
            <Label>Rol central</Label>
            <Select name="centralRole" defaultValue="user">
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuario</SelectItem>
                <SelectItem value="admin">Admin central</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 border px-3 py-2 text-sm xl:col-span-4">
            <input defaultChecked name="isActive" type="checkbox" className="mt-0.5" />
            <span>Crear usuario activo</span>
          </label>
        </div>

        <div className="space-y-2 border bg-background p-3">
          <div className="space-y-1">
            <h2 className="text-sm font-medium">Acceso por aplicación</h2>
            <p className="text-xs text-muted-foreground">Marcá solo lo necesario desde el arranque.</p>
          </div>

          {applications.length ? (
            <div className="grid gap-px border bg-border">
              {applications.map((application) => (
                <div
                  key={application.key}
                  className="grid gap-px bg-border md:grid-cols-[minmax(0,1fr)_128px]"
                >
                  <label className="flex items-center gap-2 bg-background px-3 py-2 text-sm">
                    <input
                      name={`app:${application.key}:enabled`}
                      type="checkbox"
                      value="on"
                      className="mt-0.5"
                    />
                    <span className="min-w-0">
                      <span className="block font-medium leading-none">{application.name}</span>
                      <span className="block pt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {application.key}
                      </span>
                    </span>
                  </label>
                  <div className="bg-background p-1.5">
                    <Select name={`app:${application.key}:role`} defaultValue="user">
                      <SelectTrigger className="w-full">
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
        </div>

        <div className="flex flex-col-reverse gap-2 border-t pt-3 sm:flex-row sm:justify-end">
          <Link href="/users" className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}>
            Cancelar
          </Link>
          <SubmitButton className="w-full sm:w-auto" pendingLabel="Creando usuario...">
            Crear usuario
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
