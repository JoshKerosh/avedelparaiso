# PROGRESS — Mejoras de navegación "página top"

Archivo de continuidad. Actualizar al final de cada sesión/fase: marcar estado, anotar
commits y dejar el "siguiente paso" claro para retomar sin contexto previo.

- **Rama:** `feature/mejoras-navegacion-top` (creada desde `master`)
- **Plan maestro:** [PLAN.md](./PLAN.md)
- **Idioma objetivo:** español · **Alcance:** top completo

## Estado de fases

| Fase | Archivo | Estado | Commit |
|------|---------|--------|--------|
| 1 — Navbar + layout + footer | [FASE-1](./FASE-1-navbar-layout-footer.md) | ⬜ Pendiente | — |
| 2 — Catálogo + filtros | [FASE-2](./FASE-2-catalogo-filtros.md) | ⬜ Pendiente | — |
| 3 — Detalle + tarjetas + home | [FASE-3](./FASE-3-detalle-tarjetas-home.md) | ⬜ Pendiente | — |
| 4 — Idioma: estados + admin | [FASE-4](./FASE-4-idioma-estados-admin.md) | ⬜ Pendiente | — |

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
- Posible necesidad de `<Suspense>` alrededor del buscador de la navbar por `useSearchParams()`
  en Next 16 (confirmar en el build de Fase 1).

## Bitácora
<!-- Formato sugerido por entrada:
### YYYY-MM-DD — Fase N
- Hecho: ...
- Commit: <hash> "<mensaje>"
- Siguiente paso: ...
-->
- 2026-06-21 — Planificación. Creada la rama y dividido el plan en 4 fases + este PROGRESS.
  Siguiente paso: implementar **Fase 1**.
