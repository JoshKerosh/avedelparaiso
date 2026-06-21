# KNOWN-GAPS — Limitaciones conocidas

Gaps documentados para seguimiento. Los que se resuelven se marcan y se mueven su detalle
a la bitácora de [PROGRESS.md](./PROGRESS.md).

> Estado: 🔴 Abierto · 🟢 Resuelto

## KG-1 — Sub-páginas y modales del panel admin en inglés 🟢 Resuelto (Fase 5)
- **Era:** fuera del dashboard, el panel admin conservaba texto en inglés (login, products,
  categories, settings y los modales ReduceStock/ConfirmReduce/StockHistory/ProductForm,
  más ProductsTable).
- **Resuelto:** Fase 5 tradujo todas las páginas y componentes admin al español (sin librería
  de i18n), incluidas fechas `es-CR` y la eliminación de un `confirm` duplicado en inglés.
  Commit `973a347`. Verificado en runtime.

## KG-2 — Datos de productos con descripción placeholder 🟢 Resuelto (Fase 5)
- **Era:** el producto "Anillo estrella" tenía la descripción basura "Hxhxbxb".
- **Resuelto:** script idempotente `scripts/fix-placeholder-descriptions.ts` que solo
  reemplaza el valor si sigue siendo el placeholder. "Sofi tech" y "Vestido Dee" se dejaron
  intactos por ser contenido propio del usuario (editables desde el admin).
  Commit `973a347`. Verificado en el detalle público.

---

### Notas / posibles mejoras futuras (no son gaps bloqueantes)
- Si en el futuro se requiere **multi-idioma conmutable** (no solo español), valdría introducir
  una librería como `next-intl` y extraer las cadenas a archivos de traducción.
- Deuda menor: `ProductFilters.tsx` consume `/api/admin/categories/children/[parentId]`
  (pública de facto, sin auth). Opcional: exponer una ruta `/api/categories/...`.
