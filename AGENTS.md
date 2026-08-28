# Contexto del proyecto

Este repositorio es un proyecto independiente.

## Commit

Siempre devolverme el comando git commit -am "{sugereniciaCommit}"

## Aislamiento

- No usar decisiones, estilos ni reglas provenientes de otros proyectos.
- No reutilizar paletas, diseños, componentes o arquitecturas externas.
- Trabajar únicamente con el contenido de este repositorio.
- No asumir preferencias históricas del usuario.
- Ante información faltante, preguntar o proponer una solución nueva.
- No copiar sistemas visuales, componentes ni configuraciones de otros repositorios aunque sean proyectos del mismo usuario.

## Fuente de verdad

Las únicas fuentes válidas son:

1. Este archivo `AGENTS.md`.
2. Los archivos del repositorio actual.
3. Las instrucciones dadas en el chat actual.

Cualquier regla, diseño, arquitectura o decisión proveniente de otro proyecto debe ignorarse.

---

# Stack visual obligatorio

Este proyecto utiliza **shadcn/ui** como base del sistema visual.

El preset obligatorio es:

```bash
npx shadcn@latest init --preset b2CPS5KoS --template next
```

Este preset debe utilizarse como base del proyecto.

No inicializar shadcn/ui utilizando otro preset.

No reemplazar este preset por la configuración por defecto de shadcn/ui.

No modificar arbitrariamente el sistema visual generado por el preset.

---

# Fuente tipográfica obligatoria

El preset utilizado puede incluir o requerir una fuente específica.

La fuente correspondiente al preset debe instalarse y configurarse obligatoriamente.

Antes de comenzar a desarrollar interfaces:

1. Identificar qué fuente utiliza el preset `b2CPS5KoS`.
2. Instalar la fuente correspondiente.
3. Configurarla correctamente en Next.js.
4. Preferir `next/font` cuando la fuente esté disponible mediante Google Fonts o pueda integrarse localmente.
5. Aplicarla globalmente al proyecto.
6. Verificar que realmente esté siendo utilizada por la aplicación.

No utilizar una fuente fallback como solución permanente.

No sustituir la fuente del preset por Inter, Arial, system-ui u otra fuente salvo instrucción explícita del usuario.

La aplicación no debe considerarse visualmente configurada hasta que la fuente del preset esté correctamente instalada y funcionando.

---

# Sistema visual obligatorio

El sistema visual base del proyecto corresponde al preset indicado anteriormente.

El archivo `globals.css` debe conservar como base las siguientes variables:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.508 0.118 165.612);
  --primary-foreground: oklch(0.979 0.021 166.113);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.845 0.143 164.978);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.596 0.145 163.225);
  --chart-4: oklch(0.508 0.118 165.612);
  --chart-5: oklch(0.432 0.095 166.913);
  --radius: 0;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.596 0.145 163.225);
  --sidebar-primary-foreground: oklch(0.979 0.021 166.113);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.432 0.095 166.913);
  --primary-foreground: oklch(0.979 0.021 166.113);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.845 0.143 164.978);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.596 0.145 163.225);
  --chart-4: oklch(0.508 0.118 165.612);
  --chart-5: oklch(0.432 0.095 166.913);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.696 0.17 162.48);
  --sidebar-primary-foreground: oklch(0.262 0.051 172.552);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}
```

Estas variables constituyen el sistema de colores base del proyecto.

## Reglas sobre los colores

- Utilizar las variables semánticas del tema.
- Utilizar `primary`, `secondary`, `muted`, `accent`, `destructive`, etc.
- No introducir colores arbitrarios si existe una variable semántica equivalente.
- No reemplazar la paleta por colores provenientes de otros proyectos.
- No cambiar `--primary` ni las variables principales sin una solicitud explícita.
- Mantener compatibilidad con modo claro y oscuro.
- Evitar colores hardcodeados directamente en componentes cuando puedan utilizarse tokens del sistema.

Ejemplo:

Preferir:

```tsx
className="bg-primary text-primary-foreground"
```

En lugar de:

```tsx
className="bg-emerald-600 text-white"
```

---

# Bordes y geometría

El preset define:

```css
--radius: 0;
```

Esto significa que el diseño base utiliza bordes rectos.

Por lo tanto:

- No agregar `rounded-lg`, `rounded-xl`, `rounded-2xl` o similares de manera arbitraria.
- Respetar la geometría definida por el preset.
- Los componentes deben conservar el estilo visual generado por shadcn/ui y por este preset.

Solo modificar el radio de bordes cuando exista una instrucción explícita del usuario.

---

# Componentes

Siempre que exista un componente adecuado en shadcn/ui, utilizarlo antes de crear una implementación propia.

Por ejemplo:

- Button
- Input
- Label
- Card
- Dialog
- Sheet
- Dropdown Menu
- Select
- Table
- Tabs
- Tooltip
- Badge
- Alert
- Sidebar
- Command
- Form

Los componentes deben agregarse mediante la CLI de shadcn cuando corresponda.

Ejemplo:

```bash
npx shadcn@latest add button
```

No copiar componentes manualmente desde otros proyectos.

No reutilizar componentes de otros repositorios.

Los componentes propios deben construirse específicamente para este proyecto utilizando como base el sistema visual actual.

---

# Diseño

El sistema visual debe definirse específicamente para este proyecto utilizando como punto de partida obligatorio:

- El preset `b2CPS5KoS`.
- La paleta definida en `globals.css`.
- La fuente correspondiente al preset.
- Los componentes de shadcn/ui.
- Los tokens semánticos del tema.

No reutilizar sistemas visuales anteriores salvo solicitud expresa.

Antes de crear una interfaz nueva, revisar primero:

1. Componentes existentes.
2. Tokens existentes.
3. Patrones establecidos dentro de este mismo repositorio.
4. Componentes disponibles en shadcn/ui.

Si algo no está definido, crear una solución coherente con este proyecto, no con proyectos anteriores.

---

# Regla final

Antes de comenzar cualquier trabajo visual en un proyecto recién creado, verificar obligatoriamente:

1. Que shadcn/ui esté inicializado.
2. Que se haya utilizado el preset:

```bash
npx shadcn@latest init --preset b2CPS5KoS --template next
```

3. Que `globals.css` corresponda al sistema visual definido en este archivo.
4. Que la fuente correspondiente al preset esté instalada.
5. Que la fuente esté aplicada globalmente.
6. Que los componentes utilicen los tokens semánticos del tema.

Si alguno de estos puntos no se cumple, corregirlo antes de comenzar a desarrollar la interfaz.

---

# Decisiones implementadas del MVP

- `Auth Central` corre como una app Next.js independiente.
- Better Auth administra:
  - login
  - logout
  - contraseña
  - sesiones
  - cookies
- MongoDB usa el driver oficial `mongodb` y el adapter oficial `@better-auth/mongo-adapter`.
- No se usa `mongoose` como base del proyecto.
- El rol central de administración usa el campo `role` del usuario de Better Auth.
- El estado activo/inactivo del usuario usa `user.additionalFields.isActive`.
- El acceso por aplicación se guarda en la colección `userApplicationAccess`.
- El catálogo de aplicaciones se guarda en la colección `applications`.
- El SSO MVP entre aplicaciones internas se apoya en cookie compartida por mismo hostname y en validación server-to-server contra `GET /api/internal/session`.
- Este MVP está pensado para aplicaciones mutuamente confiables bajo el mismo hostname. No resuelve SSO formal entre hostnames distintos.
- Primero debe funcionar en local. Docker, Actions y despliegue quedan fuera de esta fase.
