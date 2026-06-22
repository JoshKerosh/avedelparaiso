# Fase 2 — Catálogo y filtros

> Parte del plan [PLAN.md](./PLAN.md). Estado y continuidad en [PROGRESS.md](./PROGRESS.md).

## Objetivo
Mejorar la navegación dentro del catálogo: migas de pan, chips de filtros activos con
opción de quitar individualmente, y traducción completa al español.

## Archivos
- `app/products/page.tsx` (ajustar)
- `components/ProductFilters.tsx` (ajustar)

## Detalle técnico

### Catálogo (`app/products/page.tsx`)
- Breadcrumb arriba del `<h1>`: **Inicio / Productos** (reusar patrón de
  `app/products/[id]/page.tsx:48`).
- Traducir:
  - Título → "Todos los productos".
  - "{total} product(s) found" → "{total} producto(s) encontrado(s)".
  - "No products found." → "No se encontraron productos.".
  - Paginación → **Anterior / Siguiente / Página X de Y**, `aria-label="Paginación"`.

### Filtros (`components/ProductFilters.tsx`)
- **Chips de filtros activos** encima de los controles: una píldora por filtro aplicado
  (búsqueda, categoría 1/2/3, orden ≠ `newest`) con botón "×" que lo quita vía
  `pushFilters({ <campo>: '' })`. Para `sort`, restablecer a `'newest'`.
  - Nombres de categoría desde `rootCategories` / `categories2` / `categories3` (ya cargados).
- Traducir labels: "Filtros", "Limpiar", "Buscar", placeholder "Buscar productos...",
  "Categoría", "Subcategoría", "Sub-subcategoría", opciones "Todas...", "Ordenar por",
  y las opciones de orden: "Más recientes", "Precio: menor a mayor", "Precio: mayor a menor",
  "Nombre: A-Z".

## Task list
- [ ] Agregar breadcrumb (Inicio / Productos) en `app/products/page.tsx`.
- [ ] Traducir título, contador, vacío y paginación en `app/products/page.tsx`.
- [ ] Implementar chips de filtros activos en `components/ProductFilters.tsx` (con quitar individual).
- [ ] Traducir todos los labels/placeholders/opciones de `components/ProductFilters.tsx`.
- [ ] `npm run lint` y `npm run build` sin errores.
- [ ] Verificar manualmente (ver abajo).

## Verificación
- Breadcrumb visible y los enlaces navegan.
- Al aplicar filtros aparecen chips; al pulsar "×" en un chip se actualiza URL + grilla.
- "Limpiar" elimina todos los filtros.
- Buscador con debounce sigue funcionando; el orden cambia la grilla.
- Paginación en español; Anterior/Siguiente deshabilitados en extremos.
- Dark mode correcto en chips y controles.
