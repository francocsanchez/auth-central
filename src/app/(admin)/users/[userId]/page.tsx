import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { FlashAlert } from "@/components/feedback/flash-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  revokeUserSessionsAction,
  setUserPasswordAction,
  updateUserAction,
} from "@/features/users/actions";
import {
  getUserApplicationAccess,
  listApplications,
} from "@/lib/access/repository";
import { auth } from "@/lib/auth/auth";
import { requireCentralAdminSession } from "@/lib/auth/session";
import { getAuthUserById } from "@/lib/db/collections";
import { cn } from "@/lib/utils";

type UserDetailPageProps = {
  params: Promise<{ userId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function resolveManagedUser(userId: string, requestHeaders: Headers) {
  try {
    const user = await auth.api.getUser({
      headers: requestHeaders,
      query: { id: userId },
    });

    return user;
  } catch {
    return getAuthUserById(userId);
  }
}

async function resolveManagedUserSessions(userId: string, requestHeaders: Headers) {
  try {
    const response = await auth.api.listUserSessions({
      headers: requestHeaders,
      body: { userId },
    });

    return response.sessions;
  } catch {
    return [];
  }
}

function getUserIsActive(
  user: NonNullable<Awaited<ReturnType<typeof resolveManagedUser>>>,
) {
  return !("isActive" in user) || user.isActive !== false;
}

export default async function UserDetailPage({
  params,
  searchParams,
}: UserDetailPageProps) {
  await requireCentralAdminSession();
  const { userId } = await params;
  const requestHeaders = await headers();
  const user = await resolveManagedUser(userId, requestHeaders);

  if (!user) {
    notFound();
  }

  const [applications, accessEntries, paramsData, sessions] = await Promise.all([
    listApplications(),
    getUserApplicationAccess(userId),
    searchParams,
    resolveManagedUserSessions(userId, requestHeaders),
  ]);

  const accessMap = new Map(accessEntries.map((entry) => [entry.appKey, entry.role]));
  const isUserActive = getUserIsActive(user);

  return (
    <div className="space-y-4 p-3 lg:p-4">
      <div className="flex flex-col gap-2 border-b pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Usuario
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{user.name}</h1>
            <Badge variant={isUserActive ? "secondary" : "destructive"}>
              {isUserActive ? "Activo" : "Inactivo"}
            </Badge>
            <Badge variant={user.role?.includes("admin") ? "default" : "outline"}>
              {user.role?.includes("admin") ? "Admin central" : "Usuario"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Link
          className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
          href="/users"
        >
          <ArrowLeft className="size-4" />
          Volver
        </Link>
      </div>

      <FlashAlert
        success={Array.isArray(paramsData.success) ? paramsData.success[0] : paramsData.success}
        error={Array.isArray(paramsData.error) ? paramsData.error[0] : paramsData.error}
      />

      <form action={updateUserAction.bind(null, userId)} className="space-y-3">
        <div className="grid gap-2 border bg-background p-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_180px_140px]">
          <div className="space-y-1">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" defaultValue={user.name} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" defaultValue={user.email} type="email" required />
          </div>
          <div className="space-y-1">
            <Label>Rol central</Label>
            <Select
              name="centralRole"
              defaultValue={user.role?.includes("admin") ? "admin" : "user"}
            >
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
            <input
              name="isActive"
              type="checkbox"
              value="true"
              defaultChecked={isUserActive}
              className="mt-0.5"
            />
            <span>Usuario activo</span>
          </label>
        </div>

        <div className="space-y-2 border bg-background p-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium">Acceso por aplicación</h2>
              <p className="text-[11px] text-muted-foreground">{sessions.length} sesiones activas</p>
            </div>
            <p className="text-xs text-muted-foreground">Ajustá solo lo necesario para esta cuenta.</p>
          </div>

          {applications.length ? (
            <div className="grid gap-px border bg-border">
              {applications.map((application) => {
                const assignedRole = accessMap.get(application.key);

                return (
                  <div
                    key={application.key}
                    className="grid gap-px bg-border md:grid-cols-[minmax(0,1fr)_128px]"
                  >
                    <label className="flex min-w-0 items-center gap-2 bg-background px-3 py-2 text-sm">
                      <input
                        name={`app:${application.key}:enabled`}
                        type="checkbox"
                        value="on"
                        defaultChecked={Boolean(assignedRole)}
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
                      <Select
                        name={`app:${application.key}:role`}
                        defaultValue={assignedRole ?? "user"}
                      >
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
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay aplicaciones registradas todavía.
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t pt-3 sm:flex-row sm:justify-end">
          <Link
            href="/users"
            className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
          >
            Cancelar
          </Link>
          <SubmitButton className="w-full sm:w-auto">Guardar cambios</SubmitButton>
        </div>
      </form>

      <div className="grid gap-3 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-2 border bg-background p-3">
          <div className="space-y-1">
            <h2 className="text-sm font-medium">Restablecer contraseña</h2>
            <p className="text-xs text-muted-foreground">Nueva contraseña temporal.</p>
          </div>
          <form action={setUserPasswordAction.bind(null, userId)} className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <Input id="newPassword" name="newPassword" minLength={8} type="password" required />
            </div>
            <SubmitButton className="w-full sm:w-auto">Actualizar contraseña</SubmitButton>
          </form>
        </div>

        <div className="space-y-2 border bg-background p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <h2 className="text-sm font-medium">Sesiones activas</h2>
              <p className="text-xs text-muted-foreground">Actividad actual del usuario.</p>
            </div>
            <form action={revokeUserSessionsAction.bind(null, userId)}>
              <Button type="submit" variant="outline">
                Revocar sesiones
              </Button>
            </form>
          </div>
          <div className="border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expira</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Agente</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.length ? (
                  sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{new Date(session.expiresAt).toLocaleString("es-AR")}</TableCell>
                      <TableCell>{session.ipAddress ?? "N/D"}</TableCell>
                      <TableCell className="max-w-xs truncate">{session.userAgent ?? "N/D"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                      No hay sesiones activas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
