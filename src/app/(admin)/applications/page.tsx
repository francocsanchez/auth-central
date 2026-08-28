import Link from "next/link";

import { FlashAlert } from "@/components/feedback/flash-alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listApplications } from "@/lib/access/repository";
import { requireSession } from "@/lib/auth/session";

type ApplicationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  const session = await requireSession();
  const applications = await listApplications();
  const params = await searchParams;
  const allowedAppKeys = new Set(session.access.map((entry) => entry.appKey));
  const visibleApplications = session.user.isCentralAdmin
    ? applications
    : applications.filter((application) => allowedAppKeys.has(application.key));

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div className="flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Aplicaciones
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {session.user.isCentralAdmin
              ? "Catálogo de aplicaciones disponibles."
              : "Aplicaciones habilitadas para tu cuenta."}
          </h1>
        </div>
        {session.user.isCentralAdmin ? (
          <Link className={buttonVariants()} href="/applications/new" prefetch={false}>
            Crear aplicación
          </Link>
        ) : null}
      </div>

      <FlashAlert
        success={Array.isArray(params.success) ? params.success[0] : params.success}
        error={Array.isArray(params.error) ? params.error[0] : params.error}
      />

      {session.user.isCentralAdmin ? (
        <div className="border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleApplications.length ? (
                visibleApplications.map((application) => (
                  <TableRow key={application.key}>
                    <TableCell className="font-medium">{application.name}</TableCell>
                    <TableCell>{application.key}</TableCell>
                    <TableCell>{application.url ?? "Sin URL configurada"}</TableCell>
                    <TableCell>
                      <Badge variant={application.active ? "secondary" : "destructive"}>
                        {application.active ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        className={buttonVariants({ variant: "outline" })}
                        href={`/applications/${application.key}`}
                        prefetch={false}
                      >
                        Editar
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    Todavía no hay aplicaciones registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleApplications.length ? (
            visibleApplications.map((application) => (
              <div key={application.key} className="space-y-4 border bg-card p-6">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    {application.key}
                  </p>
                  <h2 className="text-xl font-semibold tracking-tight">{application.name}</h2>
                  <div>
                    <Badge variant={application.active ? "secondary" : "destructive"}>
                      {application.active ? "Disponible" : "Inactiva"}
                    </Badge>
                  </div>
                </div>
                {application.active && application.url ? (
                  <a
                    className={buttonVariants()}
                    href={application.url}
                  >
                    Ir a {application.name}
                  </a>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {application.active
                      ? "Todavía no hay un link configurado para esta aplicación."
                      : "La aplicación está inactiva en este momento."}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="border bg-card p-6 text-sm text-muted-foreground">
              No tenés aplicaciones asignadas todavía.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
