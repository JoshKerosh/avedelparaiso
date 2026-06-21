# Fixes — Plan por fases

Plan dividido en fases para corregir los hallazgos de la verificación funcional end-to-end
(Playwright) del admin/tienda de "Ave del Paraíso" (Next.js 16 + MongoDB).

## Contexto general

La verificación encontró dos defectos y un dato histórico inofensivo:

1. **Bug real** — el modal de reducir stock se renderiza una vez por fila de la tabla, lo
   que apila overlays `fixed inset-0` e intercepta los clics. → **Fase 1**
2. **Cosmético** — la home no aplica `lowStockThreshold`, mostrando "In Stock" donde otras
   páginas muestran "Low Stock". → **Fase 2**
3. **Sin acción** — usuario "Unknown" en historial antiguo (dato histórico, fallback
   correcto). No requiere cambios.

## Fases

| Fase | Archivo | Alcance | Riesgo |
|------|---------|---------|--------|
| 1 | [phase-1-modal-fix.md](./phase-1-modal-fix.md) | Reubicar modales fuera del `map` en `app/admin/products/page.tsx` | Medio (mover JSX) |
| 2 | [phase-2-home-badge.md](./phase-2-home-badge.md) | Badge de 3 estados en `app/page.tsx` | Bajo |
| 3 | [phase-3-verification.md](./phase-3-verification.md) | QA end-to-end (Playwright + tsc + lint) | — |

## Orden recomendado

Fase 1 → Fase 2 → Fase 3. Las fases 1 y 2 son independientes (archivos distintos) y podrían
hacerse en cualquier orden; la fase 3 valida ambas.

## Decisiones de alcance (confirmadas con el usuario)

- Badge de la home: arreglo mínimo en `app/page.tsx` (no extraer helper a `lib/`).
- Usuario "Unknown" del historial: sin cambios.
