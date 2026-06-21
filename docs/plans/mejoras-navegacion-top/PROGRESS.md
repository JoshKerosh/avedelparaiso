# PROGRESS — Mejoras de navegación "página top"

Archivo de continuidad. Actualizar al final de cada sesión/fase: marcar estado, anotar
commits y dejar el "siguiente paso" claro para retomar sin contexto previo.

- **Rama:** `feature/mejoras-navegacion-top` (creada desde `master`)
- **Plan maestro:** [PLAN.md](./PLAN.md)
- **Idioma objetivo:** español · **Alcance:** top completo

## Estado de fases

| Fase | Archivo | Estado | Commit |
|------|---------|--------|--------|
| 1 — Navbar + layout + footer | [FASE-1](./FASE-1-navbar-layout-footer.md) | ✅ Completada | `b9c8cb2` |
| 2 — Catálogo + filtros | [FASE-2](./FASE-2-catalogo-filtros.md) | ✅ Completada | `912053b` |
| 3 — Detalle + tarjetas + home | [FASE-3](./FASE-3-detalle-tarjetas-home.md) | ✅ Completada | `234f31f` |
| 4 — Idioma: estados + admin | [FASE-4](./FASE-4-idioma-estados-admin.md) | ✅ Completada | `6a33f1d` |
| 5 — i18n admin + datos (KG-1/KG-2) | [FASE-5](./FASE-5-i18n-admin-y-datos.md) | ✅ Completada | `973a347` |

> Leyenda: ⬜ Pendiente · 🟡 En progreso · ✅ Completada · ⏸️ Bloqueada

## Decisiones tomadas
- Idioma de toda la UI: **español** (coherente con precios `₡`/`es-CR` y metadatos).
- Alcance "top completo": incluye accesibilidad (skip link, `aria-current`, foco móvil),
  footer, buscador en navbar y coherencia con el panel admin.
- `Navigation.tsx` se implementa **desde cero** (un intento previo no se conservó al cambiar de rama).

## Pendientes / deuda técnica
- `ProductFilters.tsx` consume `/api/admin/categories/children/[parentId]` (sin auth, funciona).
  Deuda opcional: exponer ruta pública `/api/categories/...` reusando `getChildCategories`
  (`lib/products.ts:168`).
- `useSearchParams()` de la navbar: resuelto aislándolo en `NavSearch` bajo `<Suspense>`
  (Fase 1). Build OK.
- Gaps detectados durante el desarrollo: ver [GAPS.md](./GAPS.md) (GAP-1 resuelto) y
  [KNOWN-GAPS.md](./KNOWN-GAPS.md) (admin back-office aún en inglés — fuera de alcance).

## Bitácora
<!-- Formato sugerido por entrada:
### YYYY-MM-DD — Fase N
- Hecho: ...
- Commit: <hash> "<mensaje>"
- Siguiente paso: ...
-->
- 2026-06-21 — Planificación. Creada la rama y dividido el plan en 4 fases + este PROGRESS.
  Siguiente paso: implementar **Fase 1**.

### 2026-06-21 — Fase 1 (Navbar + layout + footer) ✅
- Hecho:
  - `components/Navigation.tsx` reescrito: links español (Inicio/Productos/Admin), Admin solo
    autenticado, botón Cerrar sesión, página activa con `aria-current`, brand mark, menú móvil
    accesible (`aria-expanded`/`aria-controls`, cierre al navegar).
  - `components/NavSearch.tsx` (nuevo): buscador aislado bajo `<Suspense>` por `useSearchParams()`.
  - `components/Footer.tsx` (nuevo): 3 columnas + copyright con año dinámico.
  - `app/layout.tsx`: `lang="es"`, skip link, `<main id="main">`, flex layout, `<Footer/>`.
- Verificación: lint 0 errores (16 warnings preexistentes), build OK, 25 tests OK.
  Runtime (Playwright en localhost:3000): navbar/footer/skip-link OK, sesión admin muestra
  enlaces correctos, 0 errores de consola en `/` y `/products`.
- Gaps: ninguno nuevo. (Home/products siguen en inglés → se traducen en Fases 2-3, planificado.)
- Commit: `b9c8cb2`
- Siguiente paso: **Fase 2** (catálogo + filtros).

### 2026-06-21 — Fase 2 (Catálogo + filtros) ✅
- Hecho:
  - `app/products/page.tsx`: breadcrumb (Inicio/Productos), título "Todos los productos",
    contador con plural correcto, vacío y paginación en español, `aria-label="Paginación"`.
  - `components/ProductFilters.tsx`: chips de filtros activos con quitar individual
    (búsqueda, cat 1/2/3, orden) + todos los labels/opciones traducidos.
- Verificación: lint 0 errores (16 warnings preexistentes), build OK.
  Runtime (Playwright): chip "Búsqueda: anillo" aparece y al pulsar × la URL pasa de
  `?search=anillo` a `/products`; labels y orden en español; 0 errores de consola.
- Gaps: ninguno nuevo. (Tarjeta sigue mostrando "Low Stock"/"in stock" → Fase 3.)
- Commit: `912053b`
- Siguiente paso: **Fase 3** (detalle + tarjetas + home).

### 2026-06-21 — Fase 3 (Detalle + tarjetas + home) ✅
- Hecho:
  - `app/products/[id]/page.tsx`: categorías clicables en breadcrumb y sección "Categoría"
    (enlazan a `/products?categoryN=<id>` con sus padres); textos en español; singular/plural
    en "unidad(es) en stock".
  - `lib/product-ui.ts`: estados → Agotado / Pocas unidades / Disponible (+ test actualizado).
  - `components/ProductCard.tsx`: "N disponibles". `app/page.tsx`: home en español.
- Verificación: lint 0 errores, build OK, 25 tests OK.
  Runtime (Playwright): breadcrumb Inicio/Productos/Accesorios/Anillos clicable; clic en
  "Accesorios" navega a `/products?category1=...`, filtra a 2 productos y muestra chip;
  badges "Pocas unidades"/"Disponible" y home en español; 0 errores de consola.
- Gaps: ninguno nuevo (el ajuste singular/plural se resolvió en la misma fase).
- Commit: `234f31f`
- Siguiente paso: **Fase 4** (idioma: estados + admin).

### 2026-06-21 — Fase 4 (Idioma: estados + admin) ✅
- Hecho:
  - `app/not-found.tsx` y `app/error.tsx`: copy y botones en español.
  - `app/admin/page.tsx`: dashboard en español (tarjetas, stats, alertas, tabla) + fechas es-CR.
  - **GAP-1** (códigos de motivo en inglés): `STOCK_REASON_LABELS` + `getReasonLabel` en
    `lib/product-ui.ts`, aplicados en dashboard, `StockHistoryModal` y radios de
    `ReduceStockModal` (sin migrar datos). Ver [GAPS.md](./GAPS.md).
- Verificación: lint 0 errores, build OK, 25 tests OK.
  Runtime (Playwright): 404 en español; dashboard en español; columna Motivo muestra
  "Ajuste manual"/"Venta"; fechas es-CR; 0 errores de consola (salvo el status 404 esperado).
- Gaps: GAP-1 **resuelto**. Resto del back-office admin en inglés → documentado en
  [KNOWN-GAPS.md](./KNOWN-GAPS.md) (KG-1, fuera de alcance de este plan).
- Commit: `6a33f1d`

### 2026-06-21 — Fase 5 (i18n admin + datos placeholder) ✅
- Hecho (resuelve KG-1 y KG-2 de KNOWN-GAPS):
  - Traducción completa del back-office: `login`, `products`, `categories`, `settings` y los
    modales (`ReduceStockModal`, `ConfirmReduceModal`, `StockHistoryModal`, `ProductFormModal`,
    `ProductsTable`). Fechas `es-CR` en el historial; eliminado un `confirm` duplicado en inglés.
  - KG-2: `scripts/fix-placeholder-descriptions.ts` (idempotente) reemplazó "Hxhxbxb" en
    "Anillo estrella"; "Sofi tech"/"Vestido Dee" intactos (contenido del usuario).
- Verificación: lint 0 errores, build OK, 25 tests OK.
  Runtime (Playwright): panel de productos y modales en español; detalle de "Anillo estrella"
  ya muestra descripción presentable; 0 errores de consola.
- Gaps: KG-1 y KG-2 **resueltos** (ver [KNOWN-GAPS.md](./KNOWN-GAPS.md) y [GAPS.md](./GAPS.md)).
- Commit: `973a347`

## ✅ Plan completado
Las 5 fases están ✅. `GAPS.md` y `KNOWN-GAPS.md` no tienen gaps abiertos (KG-1 y KG-2
resueltos en Fase 5). Toda la UI —pública y admin— quedó en español. Rama
`feature/mejoras-navegacion-top` lista para PR a `master`.
