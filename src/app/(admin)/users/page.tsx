import Link from "next/link";
import { Search } from "lucide-react";

import { FlashAlert } from "@/components/feedback/flash-alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAuthUsers } from "@/lib/db/collections";
import { requireCentralAdminSession } from "@/lib/auth/session";

type UsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  await requireCentralAdminSession();
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] : params.q;
  const users = await listAuthUsers(query);
  const success = Array.isArray(params.success) ? params.success[0] : params.success;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <div className="space-y-8 p-6 lg:p-10">
      <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Usuarios
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Administración central de cuentas.
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Buscá, auditá y abrí cada cuenta desde una vista operativa pensada para resolver altas,
            bloqueos y permisos en pocos pasos.
          </p>
        </div>
        <Link className={buttonVariants()} href="/users/new">
          Crear usuario
        </Link>
      </div>

      <FlashAlert success={success} error={error} />

      <div className="grid gap-px border bg-border md:grid-cols-3">
        <div className="space-y-1 bg-background p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Total
          </p>
          <p className="text-2xl font-semibold tracking-tight">{users.length}</p>
        </div>
        <div className="space-y-1 bg-background p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Filtro
          </p>
          <p className="text-sm font-medium">
            {query?.trim() ? `Resultados para "${query.trim()}"` : "Mostrando todas las cuentas"}
          </p>
        </div>
        <div className="space-y-1 bg-background p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Acción rápida
          </p>
          <p className="text-sm text-muted-foreground">
            Abrí una cuenta para editar su estado, contraseña y accesos por aplicación.
          </p>
        </div>
      </div>

      <form className="border bg-background p-4" method="get">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              defaultValue={query}
              placeholder="Buscar por nombre o email"
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
        </div>
      </form>

      <div className="border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Rol central</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive === false ? "destructive" : "secondary"}>
                      {user.isActive === false ? "Inactivo" : "Activo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role?.includes("admin") ? "default" : "outline"}>
                      {user.role?.includes("admin") ? "Admin central" : "Usuario"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      className={buttonVariants({ variant: "outline" })}
                      href={`/users/${user.id}`}
                    >
                      Gestionar
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  No hay usuarios para mostrar con ese criterio.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
