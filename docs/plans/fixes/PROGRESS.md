# Progreso — Fixes de la verificación funcional

Seguimiento del avance de las fases. Actualizar el estado y la bitácora al completar cada
paso. Plan completo en [README.md](./README.md).

**Leyenda de estado:** ⬜ Pendiente · 🟡 En progreso · ✅ Hecho · ⏭️ Omitido · ❌ Bloqueado

## Estado general

| Fase | Descripción | Archivo del plan | Estado |
|------|-------------|------------------|--------|
| 1 | Modal de reducir stock triplicado | [phase-1-modal-fix.md](./phase-1-modal-fix.md) | ✅ Hecho |
| 2 | Badge de stock en la home | [phase-2-home-badge.md](./phase-2-home-badge.md) | ✅ Hecho |
| 3 | Verificación end-to-end | [phase-3-verification.md](./phase-3-verification.md) | ✅ Hecho |

---

## Fase 1 — Modal triplicado · ✅ Hecho

- [x] Cortar los bloques `showReduceModal` y `showConfirmReduce` del `<td>` dentro del `map`
- [x] Pegarlos a nivel de componente junto a `showModal` / `showHistoryModal`
- [x] Confirmar que el botón `−` mantiene `onClick={() => openReduceModal(product)}`
- [x] `npx tsc --noEmit` limpio
- [x] Verificado con Playwright (un solo modal, sin interceptación)

## Fase 2 — Badge home · ✅ Hecho

- [x] Añadir `lowStockThreshold: number;` a la interfaz `Product`
- [x] Añadir helper local `getStockStatus(product)` (3 estados)
- [x] Reemplazar el `<span>` inline del badge por el helper
- [x] `npx tsc --noEmit` limpio
- [x] Verificado: home y listado coinciden para el mismo producto

## Fase 3 — Verificación · ✅ Hecho

- [x] Fix 1 verificado con Playwright (modal único; reducir 1→0 y restaurar 0→1)
- [x] Fix 2 verificado con Playwright (home: Anillo/Sofi = Low Stock, Vestido = In Stock)
- [x] Smoke de regresión (dashboard, categorías, settings, tienda, detalle)
- [x] 0 errores de consola en las páginas recorridas (recarga limpia de la home)
- [x] `npx tsc --noEmit` limpio; lint sin errores nuevos en archivos modificados
- [ ] (Opcional) commit + push — pendiente de indicación del usuario

---

## Bitácora

Registrar cada avance con fecha y resumen (lo más reciente arriba).

| Fecha | Fase | Nota |
|-------|------|------|
| 2026-06-20 | 1-3 | Fases implementadas y verificadas con Playwright. `tsc` limpio. Lint sin errores nuevos (los `any`/`prefer-const` reportados son preexistentes). Pendiente solo el commit/push opcional. |
| 2026-06-20 | — | Plan dividido en fases y creado este archivo de progreso. |
