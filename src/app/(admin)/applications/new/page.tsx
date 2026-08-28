import { FlashAlert } from "@/components/feedback/flash-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createApplicationAction } from "@/features/applications/actions";
import { requireCentralAdminSession } from "@/lib/auth/session";

type NewApplicationPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewApplicationPage({
  searchParams,
}: NewApplicationPageProps) {
  await requireCentralAdminSession();
  const params = await searchParams;

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Aplicaciones
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Crear aplicación.
        </h1>
      </div>

      <FlashAlert
        success={Array.isArray(params.success) ? params.success[0] : params.success}
        error={Array.isArray(params.error) ? params.error[0] : params.error}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Datos base</CardTitle>
          <CardDescription>
            La `key` será estable y se usará en las verificaciones de acceso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createApplicationAction} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key">Key</Label>
              <Input
                id="key"
                name="key"
                placeholder="intranic"
                pattern="[a-z0-9-]+"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL de la aplicación</Label>
              <Input
                id="url"
                name="url"
                placeholder="http://localhost:3000"
                type="url"
              />
            </div>
            <label className="flex items-center gap-3 border px-4 py-3 text-sm">
              <input defaultChecked name="active" type="checkbox" />
              Crear aplicación activa
            </label>
            <SubmitButton>Crear aplicación</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
