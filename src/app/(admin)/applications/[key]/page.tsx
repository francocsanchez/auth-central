import { notFound } from "next/navigation";

import { FlashAlert } from "@/components/feedback/flash-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateApplicationAction } from "@/features/applications/actions";
import { getApplicationByKey } from "@/lib/access/repository";
import { requireCentralAdminSession } from "@/lib/auth/session";

type ApplicationDetailPageProps = {
  params: Promise<{ key: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: ApplicationDetailPageProps) {
  await requireCentralAdminSession();
  const { key } = await params;
  const application = await getApplicationByKey(key);

  if (!application) {
    notFound();
  }

  const paramsData = await searchParams;

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Aplicación
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {application.name}
        </h1>
      </div>

      <FlashAlert
        success={Array.isArray(paramsData.success) ? paramsData.success[0] : paramsData.success}
        error={Array.isArray(paramsData.error) ? paramsData.error[0] : paramsData.error}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
          <CardDescription>
            Cambios mínimos y estables para el MVP local.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateApplicationAction.bind(null, key)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" defaultValue={application.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key">Key</Label>
              <Input id="key" name="key" defaultValue={application.key} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL de la aplicación</Label>
              <Input
                id="url"
                name="url"
                defaultValue={application.url ?? ""}
                type="url"
              />
            </div>
            <label className="flex items-center gap-3 border px-4 py-3 text-sm">
              <input
                name="active"
                type="checkbox"
                defaultChecked={application.active}
              />
              Aplicación activa
            </label>
            <SubmitButton>Guardar aplicación</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
