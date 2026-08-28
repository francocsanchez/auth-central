# Producción con GHCR y Portainer

## Datos base

- Stack recomendado: `auth-central`
- Puerto externo configurado: `32770`
- Puerto interno del contenedor: `3000`
- Imagen GHCR esperada: `ghcr.io/<usuario-o-organizacion>/<repositorio>:latest`
- Este repositorio no tiene un remoto Git configurado en este entorno, por eso el owner/repo exacto debe definirse en GitHub y luego usarse en `GHCR_IMAGE`.

## Variables que tenés que cargar en Portainer

- `GHCR_IMAGE`
  - Ejemplo: `ghcr.io/tu-organizacion/multi-login:latest`
- `AUTH_BASE_URL`
  - Ejemplo: `http://IP_DEL_SERVIDOR:32770`
- `BETTER_AUTH_URL`
  - Ejemplo: `http://IP_DEL_SERVIDOR:32770`
- `BETTER_AUTH_SECRET`
  - Generar un secreto largo, aleatorio y de al menos 32 caracteres.
- `MONGODB_URI`
  - URI de tu MongoDB existente o de producción.
- `MONGODB_DB_NAME`
  - Ejemplo: `auth-central`
- `TRUSTED_ORIGINS`
  - Lista separada por comas con los orígenes permitidos para integraciones.
- `ALLOWED_RETURN_TO_ORIGINS`
  - Lista separada por comas con los destinos permitidos luego del login/logout.

## Variables opcionales para bootstrap inicial

- `BOOTSTRAP_ON_STARTUP`
  - Poner `true` solo en el primer arranque si querés que el contenedor cree el admin base y las apps `intranic` / `nfc`.
- `BOOTSTRAP_ADMIN_EMAIL`
- `BOOTSTRAP_ADMIN_NAME`
- `BOOTSTRAP_ADMIN_PASSWORD`
- `BOOTSTRAP_INTRANIC_NAME`
- `BOOTSTRAP_NFC_NAME`

Si activás `BOOTSTRAP_ON_STARTUP=true`, no dejes el password de ejemplo.

## Despliegue en Portainer

1. Hacer `git push` al branch principal del repo en GitHub.
2. Esperar a que GitHub Actions construya y publique la imagen en GHCR.
3. Entrar a Portainer.
4. Crear un Stack nuevo.
5. Pegar el contenido de [docker-compose.yml](/C:/apps/multi-login/docker-compose.yml).
6. Completar las variables de entorno indicadas arriba.
7. Hacer deploy del Stack.

La app debería quedar disponible en `http://IP_DEL_SERVIDOR:32770`.

## Actualizar la aplicación

1. Hacer cambios y `git push`.
2. Esperar la nueva imagen en GHCR.
3. En Portainer, abrir el Stack.
4. Usar `Pull and redeploy` o recrear el Stack con la misma configuración.

## Logs y reinicio

- Ver logs: abrir el contenedor `auth-central` en Portainer y entrar a `Logs`.
- Reiniciar: usar `Restart` sobre el contenedor o redeploy del Stack.

## Verificación rápida

1. Abrir `http://IP_DEL_SERVIDOR:32770/login`.
2. Confirmar que la pantalla carga.
3. Probar login con el admin bootstrap si fue inicializado.
4. Validar que la app pueda consultar MongoDB correctamente.
