# Fase 1 — Seguridad crítica

> **Objetivo:** cerrar los agujeros que hacen insegura la app en producción pública.
> **Prioridad:** máxima — hacer ANTES que cualquier otra fase.
> **Estado:** ver `PROGRESS.md`. Esta fase es un PR independiente y desplegable.

## Prerrequisitos
- Acceso a `.env.local` para añadir nuevas variables (`SEED_TOKEN`, `SEED_ADMIN_*`).
- Confirmar variables de entorno en Vercel para producción.

## Resultado esperado (Definition of Done)
- Ningún endpoint HTTP crea usuarios o datos.
- La firma de subida a Cloudinary requiere sesión.
- Los errores no devuelven `error.message` al cliente.
- `/admin/*` redirige a login sin sesión (capa de middleware).
- Login y firma de subida con rate limit básico.

---

## Tarea 1.1 — Neutralizar `/api/seed`
**Archivo:** `app/api/seed/route.ts` · **Riesgo que cierra:** creación pública de admin `admin`/`admin`.

- [ ] Mover la lógica de creación de categorías/productos de prueba a `scripts/seed.ts`
      (o a un nuevo `scripts/seed-test-data.ts` invocado por `npm run seed`).
- [ ] Mover el `const USD_TO_CRC = 500` (hoy mal colocado en líneas 1-2, antes de imports)
      al script.
- [ ] **Eliminar** `app/api/seed/route.ts` por completo (opción recomendada).
- [ ] _Alternativa si se quiere conservar HTTP:_ devolver 404 salvo que
      `process.env.NODE_ENV !== 'production'` **y** header `x-seed-token === process.env.SEED_TOKEN`.
- [ ] Verificar que ninguna parte del frontend llama a `/api/seed`.

**Aceptación:** `GET /api/seed` → 404 (o ruta inexistente). `npm run seed` sigue poblando datos.

---

## Tarea 1.2 — Rotar credenciales admin
**Archivo:** `scripts/seed.ts` · **Riesgo:** credenciales por defecto conocidas.

- [ ] Dejar de hardcodear `admin`/`admin`.
- [ ] Leer `process.env.SEED_ADMIN_USER` y `process.env.SEED_ADMIN_PASSWORD`.
- [ ] Si `SEED_ADMIN_PASSWORD` falta, generar una password aleatoria fuerte
      (`crypto.randomBytes`) e imprimirla **una sola vez** en consola.
- [ ] Mantener el hash bcrypt (cost 10) existente.
- [ ] Añadir las nuevas variables a `.env.local` y al ejemplo de env del README (Fase 5.3).

**Aceptación:** ejecutar `npm run seed` no crea un usuario con password `admin`; la password
se toma de env o se genera y se muestra.

---

## Tarea 1.3 — Auth en `/api/upload/signature`
**Archivo:** `app/api/upload/signature/route.ts` · **Riesgo:** cualquier anónimo firma subidas a tu Cloudinary.

- [ ] Importar `getServerSession` (`next-auth`) y `authOptions` (`@/app/api/auth/[...nextauth]/route`).
- [ ] Al inicio del `POST`:
      ```ts
      const session = await getServerSession(authOptions);
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      ```
- [ ] Verificar que el flujo de subida del admin sigue funcionando (usuario logueado).

**Aceptación:** `POST /api/upload/signature` sin cookie de sesión → 401; con sesión → firma válida.

---

## Tarea 1.4 — Helper de errores (no filtrar `error.message`)
**Archivos:** nuevo `lib/apiError.ts` + todas las rutas bajo `app/api/**`.

- [ ] Crear `lib/apiError.ts`:
      ```ts
      import { NextResponse } from 'next/server';

      export function handleApiError(error: unknown, status = 500) {
        console.error(error); // log real solo en servidor
        return NextResponse.json({ error: 'Internal server error' }, { status });
      }
      ```
- [ ] Reemplazar cada `catch (error: any) { ... error.message }` por
      `catch (error) { return handleApiError(error); }`.
- [ ] Para errores esperados (validación → 400, no encontrado → 404) seguir devolviendo
      mensajes explícitos y controlados (no de excepción).
- [ ] Rutas a revisar: `app/api/products/route.ts`, `app/api/products/[id]/route.ts`,
      `app/api/admin/products/route.ts`, `app/api/admin/products/[id]/route.ts`,
      `app/api/admin/products/[id]/stock/route.ts`, `.../history/route.ts`,
      `app/api/admin/categories/route.ts`, `app/api/admin/categories/[id]/route.ts`,
      `app/api/admin/categories/children/[parentId]/route.ts`,
      `app/api/admin/dashboard/route.ts`, `app/api/admin/settings/route.ts`,
      `app/api/upload/signature/route.ts`.

**Aceptación:** provocar un error interno (p.ej. id inválido) → la respuesta es
`{ error: 'Internal server error' }` sin stack ni detalle de Mongo.

---

## Tarea 1.5 — Middleware de protección de `/admin`
**Archivo:** nuevo `middleware.ts` en la raíz.

- [ ] Crear `middleware.ts` con `withAuth` de `next-auth/middleware`.
- [ ] Proteger `/admin/:path*` excepto `/admin/login`.
- [ ] (Opcional, defensa en profundidad) cubrir `/api/admin/:path*`.
- [ ] Mantener `ProtectedRoute.tsx` y los guards por handler (no eliminarlos: capas).
- [ ] Configurar `matcher` para no interceptar assets estáticos.

```ts
// middleware.ts
export { default } from 'next-auth/middleware';
export const config = { matcher: ['/admin/:path*'] };
// nota: excluir /admin/login vía lógica de authorized callback o página pública.
```

**Aceptación:** abrir `/admin` sin sesión redirige a `/admin/login`; con sesión carga normal.

---

## Tarea 1.6 — Rate limiting básico
**Archivos:** nuevo `lib/rateLimit.ts` + `app/api/auth/[...nextauth]/route.ts` + `app/api/upload/signature/route.ts`.

- [ ] Crear `lib/rateLimit.ts`: limitador en memoria por `IP + clave + ventana` usando un
      `Map` (suficiente para una instancia). Devuelve `true/false` (permitido).
- [ ] Aplicar en `authorize()` del provider de credenciales (limitar intentos de login por IP).
- [ ] Aplicar en `/api/upload/signature`.
- [ ] Documentar en el archivo que para multi-instancia real se necesita Upstash/Redis (mejora futura).

**Aceptación:** N intentos rápidos de login desde la misma IP empiezan a rechazarse con 429.

---

## Verificación de la fase (Gate F1)
- [ ] `GET /api/seed` → 404 / ruta eliminada.
- [ ] `POST /api/upload/signature` sin sesión → 401.
- [ ] Error interno → respuesta genérica sin internals.
- [ ] `/admin` sin login → redirect a `/admin/login`.
- [ ] Login con muchos intentos → 429.
- [ ] `npm run lint` y `npm run build` sin errores.

## Patrones a reutilizar
- Guard de auth: `getServerSession(authOptions)` + 401 (ver `app/api/admin/products/route.ts`).
- `await connectDB()` antes de cualquier query (`lib/mongodb.ts`).

## Al terminar
Actualiza `PROGRESS.md`: marca 1.1–1.6 ✅, anota commit/PR y cierra el Gate F1.
