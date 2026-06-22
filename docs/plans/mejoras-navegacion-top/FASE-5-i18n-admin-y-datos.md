# Fase 5 — Cierre de KNOWN-GAPS: i18n del back-office admin + datos placeholder

> Parte del plan [PLAN.md](./PLAN.md). Resuelve KG-1 y KG-2 de [KNOWN-GAPS.md](./KNOWN-GAPS.md).

## Objetivo
Llevar el panel admin completo al español (coherencia total de idioma) y limpiar los datos
placeholder evidentes. No se introduce librería de i18n (traducción directa, mismo enfoque
que las fases previas).

## KG-1 — Traducir back-office admin

### Páginas
- `app/admin/login/page.tsx`: "Admin Login", labels Username/Password, placeholders, botón
  Login/Logging in, toasts ("Login successful!", "An error occurred..."), nota de credenciales.
- `app/admin/products/page.tsx`: título "Products"/"Manage your inventory", botón "Add Product",
  estados de carga/vacío, y todos los `toast.*` (created/updated/deleted/stock/errores) +
  `window.confirm` de borrado.
- `app/admin/categories/page.tsx`: título y subtítulo, "Add Category", carga/vacío,
  textos de árbol ("No subcategories", "No sub-subcategories"), `title` de botones
  (Add Subcategory/Edit/Delete), modal (Add/Edit Category, Category Name, Description,
  Cancel, Create/Update), toasts. **Bug:** hay un `confirm` duplicado (inglés + español) en
  `handleDelete` → dejar solo el español.
- `app/admin/settings/page.tsx`: "Settings"/"Manage your site settings", "Hero Banner" y su
  descripción, "Current Banner", "Remove Banner", "No hero banner uploaded yet",
  "Change/Upload Banner", "Saving...", tip, toasts y `confirm`.

### Componentes admin
- `components/admin/ProductsTable.tsx`: encabezados Image/Name/Price/Stock/Actions y
  acciones History/Edit/Delete.
- `components/admin/ProductFormModal.tsx`: Add/Edit Product, Name/Description/Price/Stock/
  Low Stock Alert, "Select Level 1/2/3", Images/Upload Image, Main, Cancel, Create/Update.
- `components/admin/ReduceStockModal.tsx`: "Reduce Stock", "Amount to reduce", "Reason",
  "Observations", placeholder, Cancel/Accept. (Las etiquetas de motivo ya se tradujeron en
  Fase 4 vía `STOCK_REASON_LABELS`.)
- `components/admin/ConfirmReduceModal.tsx`: "Confirm Reduction", pregunta, Cancel/Confirm.
- `components/admin/StockHistoryModal.tsx`: "Stock History", "No stock changes yet",
  encabezados Date/Change/Reason/Observations/User, "Unknown".

## KG-2 — Datos placeholder
- Solo "Anillo estrella" tenía descripción basura ("Hxhxbxb"). Se corrige con un script de
  mantenimiento idempotente (`scripts/fix-placeholder-descriptions.ts`) que solo actualiza
  ese registro **si** sigue teniendo el valor placeholder. "Sofi tech" y "Vestido Dee" son
  contenido propio del usuario → no se tocan (editables desde el admin).

## Task list
- [ ] Traducir `app/admin/login/page.tsx`.
- [ ] Traducir `app/admin/products/page.tsx` (incl. toasts y confirm).
- [ ] Traducir `app/admin/categories/page.tsx` (+ quitar confirm duplicado en inglés).
- [ ] Traducir `app/admin/settings/page.tsx`.
- [ ] Traducir `ProductsTable`, `ProductFormModal`, `ReduceStockModal`, `ConfirmReduceModal`,
      `StockHistoryModal`.
- [ ] KG-2: script idempotente + ejecutar para limpiar "Hxhxbxb".
- [ ] `npm run lint` + `npm run build` + `npm run test` OK.
- [ ] Verificación runtime (Playwright) del panel admin en español.

## Verificación
- Login, productos, categorías y settings: todos los textos visibles en español.
- Modales (form de producto, reducir stock, confirmar, historial) en español.
- `npm run build`/`lint`/`test` sin regresiones.
- KG-2: el detalle de "Anillo estrella" ya no muestra "Hxhxbxb".
