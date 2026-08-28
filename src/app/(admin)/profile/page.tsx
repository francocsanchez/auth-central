import { FlashAlert } from "@/components/feedback/flash-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeProfilePasswordAction, updateProfileAction } from "@/features/profile/actions";
import { requireSession } from "@/lib/auth/session";

type ProfilePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const session = await requireSession();
  const params = await searchParams;

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Perfil
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Tu cuenta central.
        </h1>
      </div>

      <FlashAlert
        success={Array.isArray(params.success) ? params.success[0] : params.success}
        error={Array.isArray(params.error) ? params.error[0] : params.error}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos personales</CardTitle>
            <CardDescription>
              Actualización simple del nombre visible dentro del panel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateProfileAction} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" name="name" defaultValue={session.user.name ?? ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" defaultValue={session.user.email} disabled />
              </div>
              <SubmitButton>Guardar perfil</SubmitButton>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cambiar contraseña</CardTitle>
            <CardDescription>
              Better Auth valida la contraseña actual y revoca otras sesiones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={changeProfilePasswordAction} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña actual</Label>
                <Input id="currentPassword" name="currentPassword" minLength={8} type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <Input id="newPassword" name="newPassword" minLength={8} type="password" required />
              </div>
              <SubmitButton>Actualizar contraseña</SubmitButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
