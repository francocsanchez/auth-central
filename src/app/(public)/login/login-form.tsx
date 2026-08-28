"use client";

import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";

type LoginFormProps = {
  appKey?: string;
  returnTo: string;
  error?: string;
};

export function LoginForm({ appKey, returnTo, error }: LoginFormProps) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(
    error === "inactive"
      ? "Tu cuenta está desactivada. Contactá a un administrador."
      : error === "invalid_credentials"
        ? "Email o contraseña incorrectos."
        : error === "invalid_return_to"
          ? "La URL de retorno no está permitida."
          : null,
  );

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setMessage(null);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await authClient.signIn.email({
      email,
      password,
      callbackURL: returnTo,
      rememberMe: true,
    });

    if (result.error) {
      setMessage(result.error.message ?? "No pudimos iniciar sesión.");
      setPending(false);
      return;
    }

    window.location.href = returnTo;
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Acceso central
          </p>
          <CardTitle className="text-3xl leading-tight">
            Iniciá sesión una vez para entrar a todas las aplicaciones internas.
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Better Auth administra credenciales, sesiones y cookies. Auth Central resuelve el acceso por aplicación.
          </CardDescription>
        </div>
        {appKey ? (
          <div className="border bg-muted px-3 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Destino actual: {appKey}
          </div>
        ) : null}
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
          <Button className="w-full" type="submit" disabled={pending}>
            {pending ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
