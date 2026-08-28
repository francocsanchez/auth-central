# Auth Central

Auth Central centraliza usuarios, contraseñas, sesiones y acceso por aplicación para proyectos internos como IntraNIC y NFC.

## Stack

- Next.js 16
- TypeScript
- App Router
- Tailwind CSS v4
- shadcn/ui con preset `b2CPS5KoS`
- Better Auth `1.7.2`
- MongoDB

## Qué resuelve este MVP

- Login central con email y contraseña.
- Logout central.
- Sesiones y cookies administradas por Better Auth.
- Panel central con:
  - Dashboard
  - Usuarios
  - Aplicaciones
  - Perfil
- Roles simples por aplicación:
  - `admin`
  - `user`
  - `viewer`
- Endpoint interno para apps consumidoras:
  - `GET /api/internal/session`

## Requisitos locales

- Node.js 20.19 o superior.
- MongoDB local escuchando en `mongodb://127.0.0.1:27017`.

## Variables de entorno

Copiá `.env.example` a `.env.local` y completá los valores.

Variables principales:

- `AUTH_BASE_URL`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `TRUSTED_ORIGINS`
- `ALLOWED_RETURN_TO_ORIGINS`
- `BOOTSTRAP_ADMIN_EMAIL`
- `BOOTSTRAP_ADMIN_NAME`
- `BOOTSTRAP_ADMIN_PASSWORD`

Ejemplo local:

```env
AUTH_BASE_URL=http://localhost:3100
BETTER_AUTH_URL=http://localhost:3100
BETTER_AUTH_SECRET=replace-with-a-long-random-secret-at-least-32-chars
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=auth-central
TRUSTED_ORIGINS=http://localhost:3000,http://localhost:32768
ALLOWED_RETURN_TO_ORIGINS=http://localhost:3000,http://localhost:32768
BOOTSTRAP_ADMIN_EMAIL=admin@example.com
BOOTSTRAP_ADMIN_NAME=Auth Central Admin
BOOTSTRAP_ADMIN_PASSWORD=ChangeMe12345!
```

## Levantar Auth Central en local

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env.local` a partir de `.env.example`.

3. Asegurarte de tener MongoDB local corriendo.

4. Ejecutar el bootstrap inicial:

```bash
npm run bootstrap:local
```

Esto crea o asegura:

- la app `intranic`
- la app `nfc`
- el admin inicial configurado por variables
- acceso admin del usuario bootstrap a ambas aplicaciones

5. Levantar Auth Central:

```bash
npm run dev
```

La app corre en:

```text
http://localhost:3100
```

## Cómo probar el flujo local completo

### Auth Central

1. Entrar a `http://localhost:3100/login`.
2. Iniciar sesión con el admin bootstrap.
3. Verificar:
   - Dashboard
   - Usuarios
   - Aplicaciones
   - Perfil

### Crear un usuario de prueba

1. Ir a `Usuarios`.
2. Crear un usuario nuevo.
3. Asignarle acceso a:
   - `intranic`
   - `nfc`
4. Elegir el rol por aplicación.

### Validar SSO entre puertos

Usar una o dos apps consumidoras Next.js.

Puertos sugeridos:

```text
Auth Central   http://localhost:3100
Consumidora 1  http://localhost:3000
Consumidora 2  http://localhost:32768
```

Flujo esperado:

1. Entrar a la consumidora 1.
2. La consumidora redirige a Auth Central si no hay sesión.
3. Iniciar sesión en Auth Central.
4. Volver a la consumidora 1.
5. Entrar luego a la consumidora 2.
6. Si comparten hostname `localhost`, no debería pedir email/contraseña otra vez.

## Contrato para apps consumidoras

`GET /api/internal/session`

- Usa la cookie ya emitida por Auth Central.
- Puede recibir `?appKey=intranic`.
- Respuestas:
  - `200`: sesión válida y payload con accesos
  - `401`: sin sesión válida
  - `403`: usuario inactivo o sin acceso a la app pedida

Payload:

```ts
type CentralSession = {
  user: {
    id: string
    name: string | null
    email: string
    isActive: boolean
    isCentralAdmin: boolean
  }
  session: {
    id: string
    expiresAt: string
  }
  access: Array<{
    appKey: string
    role: "admin" | "user" | "viewer"
  }>
}
```

## Integrar una app Next.js consumidora

Hay un ejemplo en [examples/next-consumer/README.md](/C:/apps/multi-login/examples/next-consumer/README.md).

La lógica mínima es:

1. Definir variables:

```env
CENTRAL_AUTH_URL=http://localhost:3100
NEXT_PUBLIC_APP_URL=http://localhost:3000
CENTRAL_APP_KEY=intranic
```

2. En el servidor de la app consumidora:

- leer el header `cookie`
- llamar a `http://localhost:3100/api/internal/session?appKey=intranic`
- reenviar `cookie`
- si responde `401`, redirigir a `/login` del central
- si responde `403`, mostrar forbidden

3. Para login:

- redirigir a:

```text
http://localhost:3100/login?appKey=intranic&returnTo=http://localhost:3000/protected
```

4. Para logout:

- redirigir a:

```text
http://localhost:3100/logout?returnTo=http://localhost:3000/
```

## Limitaciones reales del MVP

- Este SSO simple depende de compartir hostname.
- Las cookies no se aíslan por puerto.
- No mezclar servicios no confiables bajo el mismo host.
- No hay OIDC/SAML/OAuth server en esta fase.
- No hay Docker ni configuración de producción todavía.
