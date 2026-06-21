# Plan completo de endurecimiento — Ave del Paraíso

## Contexto

La app es un MVP funcional de catálogo e-commerce + admin de inventario (Next 16 App
Router, Mongoose, NextAuth, Cloudinary). La arquitectura es sólida pero **no está
endurecida para producción pública**. La auditoría detectó: agujeros de seguridad
graves (endpoint `/api/seed` público que crea admin `admin`/`admin`, firma de subida
Cloudinary sin auth, fuga de `error.message`, sin rate limiting, sin middleware),
escritura stock+auditoría no transaccional, storefront 100% client-side (sin SEO/SSR ni
paginación), `any` generalizado que anula `strict`, un god component de 712 líneas, y
cero tests/CI.

**Objetivo:** llevar la app de MVP a estado desplegable de forma segura, con SSR/SEO,
datos consistentes, código tipado, y una red de seguridad mínima (tests + CI).

Decisiones confirmadas con el usuario: **alcance completo**, **migrar storefront a Server
Components**, **Vitest + GitHub Actions**.

El plan está en 5 fases por prioridad de riesgo. Cada fase es desplegable de forma
independiente.

---

## Fase 1 — Seguridad crítica (bloque rojo)

### 1.1 Neutralizar `/api/seed` (`app/api/seed/route.ts`)
- **Mover** toda la lógica de seed a `scripts/seed.ts` (ya existe un seed parcial allí) y
  **eliminar** el route handler HTTP por completo, o dejar un handler que devuelva 404 en
  producción y solo funcione si `process.env.NODE_ENV !== 'production'` **y** se pasa un
  header secreto `x-seed-token === process.env.SEED_TOKEN`.
- **Recomendado:** eliminar el archivo de ruta y consolidar el seeding de productos de
  prueba dentro de `scripts/seed.ts` (ejecutable vía `npm run seed`), nunca por HTTP.
- Sacar `USD_TO_CRC` y el array de productos a `scripts/` también. Mover el `const
  USD_TO_CRC` que hoy está mal colocado (líneas 1-2, antes de los imports).

### 1.2 Rotar credenciales admin
- En `scripts/seed.ts`: dejar de hardcodear `admin`/`admin`. Leer
  `process.env.SEED_ADMIN_USER` y `process.env.SEED_ADMIN_PASSWORD`; si faltan, generar
  una password aleatoria fuerte e imprimirla una sola vez en consola.
- Documentar en README que tras el primer login se debe cambiar la contraseña.

### 1.3 Proteger `/api/upload/signature` (`app/api/upload/signature/route.ts`)
- Añadir guard al inicio del `POST`:
  ```ts
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  ```
- Importar `getServerSession` y `authOptions` (mismo patrón que el resto de rutas admin).

### 1.4 Dejar de filtrar `error.message`
- Crear helper `lib/apiError.ts` con `handleApiError(error, fallbackStatus = 500)` que:
  loguee el error real en servidor (`console.error`), y devuelva al cliente un mensaje
  genérico `{ error: 'Internal server error' }` con el status. Para errores esperados
  (validación, 404) devolver mensaje explícito controlado.
- Reemplazar los `catch (error: any) { return ... error.message }` en **todas** las rutas
  bajo `app/api/**` por el helper. Tipar el catch como `catch (error)` (unknown).

### 1.5 Middleware de protección (`middleware.ts` en raíz)
- Crear `middleware.ts` que use `next-auth/middleware` (`withAuth`) para proteger
  `/admin/*` (excepto `/admin/login`) y opcionalmente `/api/admin/*` como segunda capa.
- Mantener los guards por handler (defensa en profundidad); el middleware evita render de
  páginas admin a no autenticados sin depender solo de `ProtectedRoute.tsx`.

### 1.6 Rate limiting básico
- Añadir un limitador en memoria simple para serverless: helper `lib/rateLimit.ts` con un
  `Map` por IP+ventana (suficiente para un solo proceso/instancia). Aplicar a:
  `authorize` del provider de credenciales (en `app/api/auth/[...nextauth]/route.ts`) y a
  `/api/upload/signature`.
- Nota en el plan: para escala multi-instancia real se necesitaría Upstash/Redis; dejar
  documentado como mejora futura.

**Entregable Fase 1:** ningún endpoint público crea datos/credenciales; subida firmada
requiere sesión; errores no filtran internals; `/admin` protegido por middleware; login y
firma con rate limit.

---

## Fase 2 — Integridad de datos

### 2.1 Transacción stock + StockHistory (`app/api/admin/products/[id]/stock/route.ts`)
- Validar `change`: debe ser número finito (`typeof change === 'number' && Number.isFinite(change)`),
  si no, 400.
- Envolver `product.save()` + `StockHistory.create()` en una transacción Mongo:
  ```ts
  const dbSession = await mongoose.startSession();
  await dbSession.withTransaction(async () => {
    product.stock = newStock;
    await product.save({ session: dbSession });
    await StockHistory.create([{ ...registro }], { session: dbSession });
  });
  dbSession.endSession();
  ```
- **Pre-requisito:** transacciones requieren replica set. MongoDB Atlas lo provee por
  defecto; si la URI es un standalone local, documentar fallback (try/catch que escribe
  history y, si falla, revierte stock manualmente). Verificar el entorno antes de asumir.

### 2.2 Validación de entrada en escrituras
- Añadir validación a `POST /api/admin/products` y `PUT /api/admin/products/[id]`:
  `name` (string no vacío), `price` (number ≥ 0), `stock` (number entero ≥ 0),
  `lowStockThreshold` (number ≥ 0). Devolver 400 con mensaje claro.
- Igual en `app/api/admin/categories/route.ts` (validar `name` antes de `.trim()`,
  `level ∈ {1,2,3}`).
- Opción ligera y consistente: introducir **Zod** (`npm i zod`) y un schema por entidad en
  `lib/validation/`. Reusable también en los tests. (Si se prefiere cero deps nuevas,
  validación manual; recomiendo Zod por claridad y reuso.)

### 2.3 Búsqueda: usar el índice de texto (`app/api/products/route.ts`)
- Evaluar cambiar `$regex` por `$text` (ya existe índice text en `models/Product.ts`).
  Trade-off: `$text` no hace substring parcial. **Recomendado:** mantener `$regex` para UX
  de búsqueda parcial pero documentar que el índice text queda sin uso, o añadir índice
  adecuado. Decisión menor — dejar como está y solo documentar, salvo que se quiera
  optimizar.

**Entregable Fase 2:** stock nunca se desincroniza de su auditoría; entradas inválidas se
rechazan con 400 en vez de 500.

---

## Fase 3 — Storefront a Server Components + paginación

### 3.1 Capa de datos compartida server-side
- Crear `lib/products.ts` con funciones que llamen directamente a Mongoose (no fetch HTTP):
  `getProducts({ search, category1, category2, category3, sort, page, limit })` reutilizando
  la lógica de filtrado de `app/api/products/route.ts` (extraer la construcción del query a
  una función compartida `buildProductQuery` para que API y SSR usen lo mismo).
  Devolver `{ products, total, page, totalPages }`.
- Crear `getProductById(id)` y `getRootCategories()` / `getChildCategories(parentId)`.

### 3.2 Paginación en el data layer
- Añadir `.skip()/.limit()` y `countDocuments` a `getProducts` (default `limit = 12`).
- Actualizar `app/api/products/route.ts` para aceptar `page`/`limit` y devolver metadata de
  paginación (mantener la API para compatibilidad).

### 3.3 Migrar páginas públicas a Server Components
- **`app/page.tsx` (home):** convertir a Server Component `async`. Cargar settings (hero) y
  los 8 destacados vía `lib/products.ts` con `limit: 8` (no traer todo y `.slice`). Quitar
  `'use client'`.
- **`app/products/page.tsx`:** convertir a Server Component que lee `searchParams`
  (filtros, sort, page) y renderiza la grilla server-side. Extraer la UI de filtros
  interactivos (selects dependientes, debounce de búsqueda) a un Client Component hijo
  `components/ProductFilters.tsx` que actualice la URL (`useRouter`/`Link`), de modo que el
  servidor re-renderice con los nuevos `searchParams`. Añadir controles de paginación.
- **`app/products/[id]/page.tsx`:** convertir a Server Component `async` usando
  `getProductById`. Mantener client solo el carrusel (`ImageCarousel` ya existe).
- Añadir `export const metadata`/`generateMetadata` para SEO (título, descripción, og:image
  desde la imagen principal) en home, listado y detalle.

### 3.4 Estados de carga/error y utilidades compartidas
- Crear `app/loading.tsx`, `app/products/loading.tsx`, `app/products/[id]/loading.tsx` con
  skeletons. Añadir `app/error.tsx` y `app/not-found.tsx`.
- Extraer `getMainImage` y `getStockStatus` (hoy duplicados en 3 páginas) a `lib/product-ui.ts`.
- Crear `components/ProductCard.tsx` reutilizable para home y listado.

**Entregable Fase 3:** storefront renderizado en servidor (SEO + carga inicial rápida),
paginado, con skeletons y sin lógica duplicada.

---

## Fase 4 — Calidad de código

### 4.1 Eliminar `any` y endurecer tipos
- Definir tipos compartidos en `types/` (p.ej. `types/product.ts`, `types/category.ts`)
  derivados de los modelos. Reemplazar `category1Id?: any`, `historyProduct: any`,
  `history: any[]`, `query: any`, `sortOption: any`, etc.
- Tipar todos los `catch (error: any)` → `catch (error)` + el helper de 1.4.
- Añadir regla ESLint `@typescript-eslint/no-explicit-any: 'warn'` (o error) y
  `no-console` (permitiendo `warn`/`error`) en `eslint.config.mjs`.

### 4.2 Limpiar `console.log`
- Quitar los `console.log` de debug (p.ej. `components/CloudinaryUploadWidget.tsx:99`).
  Mantener `console.error` solo en el helper de errores del servidor.
- Reemplazar los `alert()` del widget de subida por `react-hot-toast` (ya en uso) para UX
  consistente.

### 4.3 Partir el god component `app/admin/products/page.tsx` (712 líneas)
- Extraer cada modal a su propio componente bajo `components/admin/`:
  `ProductFormModal.tsx`, `StockAdjustModal.tsx`, `StockReduceModal.tsx`,
  `ConfirmModal.tsx`, `StockHistoryModal.tsx`.
- Extraer la tabla/listado a `components/admin/ProductsTable.tsx`.
- La página queda como contenedor que orquesta estado y composición.

### 4.4 Limpieza de repositorio y tooling
- Arreglar/crear `scripts/add-users.ts` (referenciado por `npm run add-users` pero no
  existe) **o** eliminar el script de `package.json`.
- Eliminar duplicado de PostCSS (`postcss.config.js` vs `.mjs`): dejar uno.
- Eliminar `test-connection.js` de la raíz y añadir `.playwright-mcp/` a `.gitignore`.
- Corregir `MONGODB_URI!` redundante en `lib/mongodb.ts:3` (quitar `!` ya que hay check
  explícito) — menor.

**Entregable Fase 4:** sin `any` ni `console.log` de debug, componentes de tamaño
razonable, repo limpio, scripts coherentes.

---

## Fase 5 — Tests + CI + Docs

### 5.1 Vitest
- `npm i -D vitest @vitest/coverage-v8`. Config `vitest.config.ts` con alias `@/*` y entorno
  `node`. Añadir scripts `"test": "vitest run"` y `"test:watch": "vitest"`.
- Tests prioritarios (unidad/integración con DB en memoria — `mongodb-memory-server`):
  - `lib/products.ts` → `buildProductQuery` cubre los 3 niveles de categoría + search.
  - Helpers `lib/product-ui.ts` (`getStockStatus`, `getMainImage`).
  - Schemas Zod de validación (Fase 2.2): casos válidos e inválidos.
  - Lógica de stock: rechazo de negativo, registro de StockHistory, rechazo de `change` no
    numérico.
- Guards de auth: test de que rutas admin devuelven 401 sin sesión (mock de
  `getServerSession`).

### 5.2 GitHub Actions (`.github/workflows/ci.yml`)
- Job en `push`/`pull_request`: `npm ci` → `npm run lint` → `npm run build` → `npm test`.
- Node 20, cache de npm. Variables dummy de entorno para que `build` no falle por checks de
  env (o mockear). Asegurar que `lib/mongodb.ts`/`lib/cloudinary.ts` no rompan el build sin
  red — pasar valores ficticios en el step.

### 5.3 README real
- Reescribir `README.md` (hoy boilerplate de create-next-app): descripción del proyecto,
  stack, requisitos, variables de entorno (las de CLAUDE.md), comandos
  (`dev/build/seed/test`), nota de seguridad sobre cambio de password admin, y cómo correr
  los tests. Enlazar los docs existentes (`SETUP.md`, `DEPLOYMENT_GUIDE.md`,
  `API_REFERENCE.md`).

**Entregable Fase 5:** red de seguridad mínima en cada push, build verificado, onboarding
claro.

---

## Archivos clave a tocar (resumen)

| Área | Archivos |
|------|----------|
| Seguridad | `app/api/seed/route.ts` (eliminar), `app/api/upload/signature/route.ts`, `app/api/auth/[...nextauth]/route.ts`, **nuevo** `middleware.ts`, **nuevo** `lib/apiError.ts`, **nuevo** `lib/rateLimit.ts`, `scripts/seed.ts` |
| Datos | `app/api/admin/products/[id]/stock/route.ts`, `app/api/admin/products/route.ts`, `app/api/admin/categories/route.ts`, **nuevo** `lib/validation/*` |
| SSR | `app/page.tsx`, `app/products/page.tsx`, `app/products/[id]/page.tsx`, `app/api/products/route.ts`, **nuevos** `lib/products.ts`, `lib/product-ui.ts`, `components/ProductFilters.tsx`, `components/ProductCard.tsx`, `app/**/loading.tsx`, `app/error.tsx`, `app/not-found.tsx` |
| Calidad | `app/admin/products/page.tsx` → `components/admin/*`, `components/CloudinaryUploadWidget.tsx`, `eslint.config.mjs`, `types/*`, `package.json`, configs PostCSS, `.gitignore` |
| Tests/CI | **nuevos** `vitest.config.ts`, `tests/**`, `.github/workflows/ci.yml`, `README.md` |

## Patrones existentes a reutilizar
- Guard de auth: `getServerSession(authOptions)` + 401 (patrón en `app/api/admin/products/route.ts`).
- Conexión: `await connectDB()` antes de cualquier query (`lib/mongodb.ts`).
- Modelos: `models.X || model('X', schema)` — importar default, nunca re-`model()`.
- Toasts: `react-hot-toast` (ya configurado en `app/layout.tsx`).
- `cn` helper en `lib/utils.ts` para clases.

## Verificación end-to-end
1. **Build/lint/types:** `npm run lint` y `npm run build` sin errores.
2. **Tests:** `npm test` en verde; cobertura de query builder, validación y stock.
3. **Seguridad manual:**
   - `GET /api/seed` → 404 (o ruta eliminada).
   - `POST /api/upload/signature` sin sesión → 401.
   - Provocar error en una ruta → la respuesta NO contiene stack/Mongo detail.
   - Acceder a `/admin` sin login → redirige a `/admin/login` (middleware).
4. **Datos:** ajustar stock con `change` no numérico → 400; simular fallo en StockHistory →
   stock no cambia (transacción).
5. **SSR/SEO:** `npm run build` muestra las páginas públicas como estáticas/SSR; ver
   `view-source` con HTML de productos presente; `<title>`/meta por producto; paginación
   navegable por URL (`/products?page=2`).
6. **UX:** skeletons visibles en navegación lenta; filtros actualizan la URL y resultados.
7. **CI:** el workflow corre verde en un PR de prueba.

## Orden de ejecución sugerido
Fase 1 → 2 (riesgo) → 5.2 CI temprano para proteger el resto → 3 (SSR) → 4 (calidad) →
5.1/5.3 (tests + docs). Cada fase es un commit/PR independiente y desplegable.
