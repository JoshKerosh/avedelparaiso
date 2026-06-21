# KNOWN-GAPS — Limitaciones conocidas (fuera de alcance de este plan)

Gaps reales pero **no resolubles dentro de las fases de este plan de navegación** (requieren
un esfuerzo o decisión que excede el alcance acordado). Documentados para seguimiento futuro.

## KG-1 — Sub-páginas y modales del panel admin aún en inglés
- **Qué:** Fuera del dashboard (`app/admin/page.tsx`, ya traducido), el resto del panel admin
  conserva texto en inglés:
  - `app/admin/products/page.tsx`, `app/admin/categories/page.tsx`, `app/admin/settings/page.tsx`.
  - Modales: `ReduceStockModal` ("Reduce Stock", "Amount to reduce", "Reason",
    "Observations", "Cancel", "Accept"), `ConfirmReduceModal` ("Confirm Reduction",
    "Cancel", "Confirm"), `StockHistoryModal`, `ProductFormModal`.
  - `components/admin/ProductsTable.tsx` y toasts varios.
- **Por qué queda fuera:** El alcance de este plan es la **navegación pública** + coherencia
  del **dashboard** admin. Traducir todo el back-office es un esfuerzo transversal mayor
  (muchas cadenas, formularios y validaciones) que merece su propio plan/fase.
- **Sugerencia futura:** Plan dedicado "i18n del panel admin" (o introducir una librería de
  i18n como `next-intl` si se requiere multi-idioma real).
- **Nota:** El GAP de **códigos de motivo** sí se resolvió (ver [GAPS.md](./GAPS.md) · GAP-1),
  porque afectaba también a la vista pública de coherencia y era de bajo riesgo.

## KG-2 — Datos de productos de ejemplo con descripciones placeholder
- **Qué:** Algunos productos sembrados tienen descripciones tipo "Hxhxbxb".
- **Por qué queda fuera:** Es contenido/data de seed, no navegación ni código.
- **Sugerencia futura:** Limpiar datos de seed o cargar catálogo real antes de producción.
