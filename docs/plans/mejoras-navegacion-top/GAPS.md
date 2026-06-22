# GAPS — Mejoras de navegación "página top"

Gaps detectados **durante** el desarrollo de las fases. Se les da seguimiento hasta
cerrarlos. Los no resolubles dentro de estas fases se mueven a [KNOWN-GAPS.md](./KNOWN-GAPS.md).

> Estado: 🔴 Abierto · 🟢 Resuelto

## GAP-1 — Códigos de motivo de stock mostrados en inglés 🟢 Resuelto
- **Detectado en:** Fase 4 (verificación del dashboard admin).
- **Qué:** Los motivos de cambio de stock (`SALE`, `DAMAGED`, `ADJUSTMENT`, `OTHER`,
  `Manual Adjustment`) se almacenan como **códigos** en la BD (`ReduceReason` +
  default de `models/StockHistory.ts`) y se mostraban tal cual (en inglés) en:
  - `app/admin/page.tsx` (tabla "Cambios de stock recientes").
  - `components/admin/StockHistoryModal.tsx` (columna motivo).
  - `components/admin/ReduceStockModal.tsx` (etiquetas de los radios).
- **Impacto:** rompía la coherencia de idioma (objetivo del plan).
- **Decisión:** solucionable sin migrar datos → mapa de visualización código→español
  (`STOCK_REASON_LABELS` + `getReasonLabel` en `lib/product-ui.ts`). Los valores
  almacenados siguen siendo los códigos; solo cambia el render.
- **Resuelto en:** Fase 4, commit de la fase. Verificado en runtime.

## GAP-2 — KNOWN-GAPS KG-1/KG-2 promovidos a trabajo 🟢 Resuelto
- **Detectado en:** a petición del usuario tras cerrar el plan original.
- **Qué:** se decidió resolver los dos KNOWN-GAPS (back-office admin en inglés y datos
  placeholder) en lugar de dejarlos diferidos.
- **Resuelto en:** Fase 5 (commit `973a347`). Ver [KNOWN-GAPS.md](./KNOWN-GAPS.md).
