# Fase 3 — Detalle de producto, tarjetas y home

> Parte del plan [PLAN.md](./PLAN.md). Estado y continuidad en [PROGRESS.md](./PROGRESS.md).

## Objetivo
Cerrar el recorrido de navegación del comprador: categorías clicables en el detalle (que
filtran el catálogo), estado de stock y tarjetas en español, y home traducida.

## Archivos
- `app/products/[id]/page.tsx` (ajustar)
- `components/ProductCard.tsx` (ajustar)
- `lib/product-ui.ts` (ajustar)
- `app/page.tsx` (ajustar)

## Detalle técnico

### Detalle (`app/products/[id]/page.tsx`)
- Hacer **clicables** las categorías del breadcrumb y de la sección "Categoría":
  - `category1Id` → `/products?category1=<id>`
  - `category2Id` → `/products?category1=<c1>&category2=<id>` (incluir el padre cuando exista)
  - `category3Id` → `.../category3=<id>` con sus padres.
  - Usar `<Link>` con `_id` ya presente en `category1Id/category2Id/category3Id`.
- Traducir: "Availability" → "Disponibilidad", "units in stock" → "unidades en stock",
  "Category" → "Categoría", "Description" → "Descripción",
  "Back to Products" → "Volver a productos".

### Estado de stock (`lib/product-ui.ts`)
- `getStockStatus` textos → "Agotado" (0), "Pocas unidades" (≤ umbral), "Disponible".

### Tarjeta (`components/ProductCard.tsx`)
- "{stock} in stock" → "{stock} disponibles".

### Home (`app/page.tsx`)
- "Featured Products" → "Productos destacados".
- "Check out our latest inventory" → "Descubre nuestro inventario más reciente".
- "No products available yet." → "Aún no hay productos disponibles.".
- "Add your first product →" → "Agrega tu primer producto →".
- "View All Products" → "Ver todos los productos".

## Task list
- [ ] Categorías clicables (breadcrumb + sección Categoría) en `app/products/[id]/page.tsx`.
- [ ] Traducir textos del detalle.
- [ ] Traducir `getStockStatus` en `lib/product-ui.ts`.
- [ ] Traducir `components/ProductCard.tsx`.
- [ ] Traducir `app/page.tsx` (home).
- [ ] `npm run lint` y `npm run build` sin errores.
- [ ] Verificar manualmente (ver abajo).

## Verificación
- En el detalle, clic en una categoría navega a `/products?categoryN=<id>` y filtra correctamente.
- Estados de stock se ven en español en tarjetas y detalle, con sus colores.
- Home completamente en español; "Ver todos los productos" lleva a `/products`.
- Dark mode correcto.
