import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const successMessages: Record<string, string> = {
  user_created: "Usuario creado correctamente.",
  user_updated: "Usuario actualizado correctamente.",
  password_updated: "Contraseña actualizada correctamente.",
  application_created: "Aplicación creada correctamente.",
  application_updated: "Aplicación actualizada correctamente.",
  profile_updated: "Perfil actualizado correctamente.",
  profile_password_updated: "Contraseña actualizada correctamente.",
  bootstrap_complete: "Bootstrap local completado.",
};

const errorMessages: Record<string, string> = {
  forbidden: "No tenés permisos para entrar a esa sección.",
  inactive: "Tu cuenta está desactivada. Contactá a un administrador.",
  invalid_credentials: "No pudimos validar tus credenciales.",
  invalid_return_to: "La URL de retorno no está permitida.",
  user_not_found: "No se encontró el usuario solicitado.",
  application_not_found: "No se encontró la aplicación solicitada.",
  action_failed: "No se pudo completar la operación.",
};

type FlashAlertProps = {
  success?: string;
  error?: string;
};

export function FlashAlert({ success, error }: FlashAlertProps) {
  const successMessage = success ? successMessages[success] ?? success : null;
  const errorMessage = error ? errorMessages[error] ?? error : null;

  if (!successMessage && !errorMessage) {
    return null;
  }

  return (
    <Alert variant={errorMessage ? "destructive" : "default"}>
      <AlertTitle>{errorMessage ? "Atención" : "Listo"}</AlertTitle>
      <AlertDescription>{errorMessage ?? successMessage}</AlertDescription>
    </Alert>
  );
}
