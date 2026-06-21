# Fase 3 — Storefront a Server Components + paginación

> **Objetivo:** renderizar el storefront en servidor (SEO + carga rápida), con paginación y
> sin lógica duplicada. **Prerrequisito:** Fases 1-2 cerradas (idealmente CI ya activo, F5.2).
> **Estado:** ver `PROGRESS.md`. PR independiente (el más grande de la fase de features).

## Resultado esperado (Definition of Done)
- Home, listado y detalle son Server Components `async` (sin `'use client'` en el contenedor).
- El HTML de productos aparece en `view-source` (SSR), con metadata SEO por página.
- El listado pagina por URL (`/products?page=2`).
- `getMainImage`/`getStockStatus` viven en un único módulo compartido.

> ⚠️ Esta fase reescribe páginas existentes. Hacer commit por tarea para poder revertir.

---

## Tarea 3.1 — Capa de datos server-side (`lib/products.ts`)
**Archivos:** nuevo `lib/products.ts` + refactor de `app/api/products/route.ts`.

- [ ] Extraer la construcción del query de categorías/búsqueda de `app/api/products/route.ts`
      (líneas ~17-90) a una función pura `buildProductQuery({ search, category1, category2, category3 })`
      en `lib/products.ts`, para que API y SSR compartan la MISMA lógica.
- [ ] Crear `getProducts({ search, category1, category2, category3, sort, page, limit })` que:
      `await connectDB()`, arma el query con `buildProductQuery`, aplica sort, `skip/limit`,
      `populate` de categorías, `.lean()`, y devuelve `{ products, total, page, totalPages }`.
- [ ] Crear `getProductById(id)` (con `populate` + `.lean()`, retorna `null` si no existe).
- [ ] Crear `getRootCategories()` y `getChildCategories(parentId)` para los filtros.
- [ ] Mantener el sort actual (`newest`, `price-asc`, `price-desc`, `name`).

**Aceptación:** `getProducts` devuelve datos correctos para filtros de los 3 niveles + búsqueda,
con metadata de paginación.

---

## Tarea 3.2 — Paginación en data layer + API
**Archivos:** `lib/products.ts` + `app/api/products/route.ts`.

- [ ] En `getProducts`: `countDocuments(query)` para `total`, `default limit = 12`,
      `skip = (page-1)*limit`, calcular `totalPages`.
- [ ] Actualizar `GET /api/products` para aceptar `page` y `limit` y devolver
      `{ products, total, page, totalPages }` (la API queda alineada con el data layer).
- [ ] Validar `page`/`limit` (enteros positivos, límite máximo razonable, p.ej. 48).

**Aceptación:** `GET /api/products?page=2&limit=12` devuelve la segunda página + metadata.

---

## Tarea 3.3 — Migrar páginas públicas a Server Components + metadata
**Archivos:** `app/page.tsx`, `app/products/page.tsx`, `app/products/[id]/page.tsx`,
nuevo `components/ProductFilters.tsx`, nuevo `components/ProductCard.tsx`.

- [ ] **`app/page.tsx` (home):** Server Component `async`. Cargar settings (hero) y los 8
      destacados con `getProducts({ limit: 8 })` (NO traer todo y `.slice(0,8)`). Quitar
      `'use client'` y los `useEffect/fetch`.
- [ ] **`app/products/page.tsx`:** Server Component que lee `searchParams`
      (`{ search, category1, category2, category3, sort, page }`) y renderiza la grilla
      server-side llamando a `getProducts`.
- [ ] Extraer los filtros interactivos (selects dependientes nivel 1→2→3, debounce de
      búsqueda, sort) a un **Client Component** `components/ProductFilters.tsx` que actualice
      la URL (`useRouter().push` / `Link` con query params); el servidor re-renderiza con los
      nuevos `searchParams`.
- [ ] Añadir controles de paginación (prev/next + número de página) que naveguen por URL.
- [ ] **`app/products/[id]/page.tsx`:** Server Component `async` usando `getProductById`;
      `notFound()` si no existe. Mantener client solo el carrusel (`ImageCarousel` ya existe).
- [ ] Añadir SEO: `export const metadata` en home/listado y `generateMetadata` en detalle
      (título, descripción, `openGraph.images` con la imagen principal del producto).

**Aceptación:** `view-source` de `/products` y `/products/[id]` contiene el HTML de los
productos; cada página tiene `<title>`/meta propios; los filtros cambian la URL y los resultados.

---

## Tarea 3.4 — Estados loading/error + utilidades compartidas
**Archivos:** `app/loading.tsx`, `app/products/loading.tsx`, `app/products/[id]/loading.tsx`,
`app/error.tsx`, `app/not-found.tsx`, nuevo `lib/product-ui.ts`, `components/ProductCard.tsx`.

- [ ] Crear `lib/product-ui.ts` con `getMainImage(product)` y `getStockStatus(product)`
      (hoy duplicados en home, listado y detalle). Tiparlos (sin `any`).
- [ ] Crear `components/ProductCard.tsx` reutilizable (usado por home y listado).
- [ ] Crear skeletons en `loading.tsx` (home, listado, detalle).
- [ ] Crear `app/error.tsx` (boundary de error con botón de reintento) y `app/not-found.tsx`.
- [ ] Reemplazar el "Loading products..." de texto plano por los skeletons.

**Aceptación:** navegación lenta muestra skeletons; un error de carga muestra `error.tsx`;
una id inexistente muestra `not-found.tsx`. Cero duplicación de `getMainImage/getStockStatus`.

---

## Verificación de la fase (Gate F3)
- [ ] `npm run build` marca las páginas públicas como SSR/estáticas según corresponda.
- [ ] `view-source` muestra productos (no shell vacío + JS).
- [ ] Metadata/`<title>` por página; og:image en detalle.
- [ ] `/products?page=2` navegable; filtros reflejados en URL.
- [ ] Skeletons + `error.tsx` + `not-found.tsx` funcionando.
- [ ] `npm run lint` y `npm run build` sin errores.

## Patrones a reutilizar
- `ImageCarousel` existente para el detalle.
- `react-hot-toast` ya configurado (para feedback en cliente si aplica).
- `cn` de `lib/utils.ts` para clases.

## Al terminar
Actualiza `PROGRESS.md`: marca 3.1–3.4, anota commit/PR, cierra el Gate F3.
