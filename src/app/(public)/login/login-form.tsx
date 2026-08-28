"use client";

import { useMemo, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth/client";

type LoginFormProps = {
  appKey?: string;
  returnTo?: string;
  error?: string;
  applications: Array<{
    key: string;
    name: string;
    url: string;
  }>;
};

export function LoginForm({ appKey, returnTo, error, applications }: LoginFormProps) {
  const defaultApplicationKey =
    (appKey && applications.some((application) => application.key === appKey) && appKey) ||
    applications[0]?.key ||
    "";
  const [pending, setPending] = useState(false);
  const [selectedAppKey, setSelectedAppKey] = useState(defaultApplicationKey);
  const [message, setMessage] = useState<string | null>(
    error === "inactive"
      ? "Tu cuenta está desactivada. Contactá a un administrador."
      : error === "invalid_credentials"
        ? "Email o contraseña incorrectos."
        : error === "invalid_return_to"
          ? "La URL de retorno no está permitida."
          : null,
  );
  const selectedApplication = useMemo(
    () => applications.find((application) => application.key === selectedAppKey) ?? null,
    [applications, selectedAppKey],
  );

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setMessage(null);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const selectedKey = String(formData.get("applicationKey") ?? "");
    const application = applications.find((item) => item.key === selectedKey);

    if (!application) {
      setMessage("Seleccioná una aplicación válida.");
      setPending(false);
      return;
    }

    const callbackURL =
      appKey && selectedKey === appKey && returnTo ? returnTo : application.url;

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL,
        rememberMe: true,
        fetchOptions: {
          onSuccess(ctx) {
            if (!ctx.data?.redirect) {
              window.location.replace(callbackURL);
            }
          },
        },
      });

      if (result.error) {
        setMessage(result.error.message ?? "No pudimos iniciar sesión.");
        return;
      }
    } catch {
      setMessage("No pudimos iniciar sesión. Revisá la URL pública y las cookies de producción.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="space-y-1">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Inicio de sesión
          </p>
          <CardTitle className="text-3xl leading-tight">Acceso central</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {message ? (
          <Alert variant="destructive">
            <AlertTitle>No fue posible iniciar sesión</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}
        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="applicationKey">Aplicación</Label>
            <Select
              name="applicationKey"
              value={selectedAppKey}
              onValueChange={(value) => setSelectedAppKey(value ?? "")}
            >
              <SelectTrigger id="applicationKey" className="h-10 w-full px-3 text-sm">
                <SelectValue placeholder="Seleccioná una aplicación" />
              </SelectTrigger>
              <SelectContent align="start">
                {applications.map((application) => (
                  <SelectItem key={application.key} value={application.key} className="text-sm">
                    {application.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedApplication ? (
              <p className="text-xs text-muted-foreground">{selectedApplication.url}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                No hay aplicaciones activas con URL configurada.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <Button className="w-full" type="submit" disabled={pending || !selectedApplication}>
            {pending ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
