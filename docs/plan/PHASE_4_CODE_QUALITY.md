# Fase 4 — Calidad de código

> **Objetivo:** eliminar deuda técnica que dificulta el mantenimiento y anula el `strict` de TS.
> **Prerrequisito:** Fases 1-3 cerradas (así se tipa el código ya migrado). **Estado:** ver `PROGRESS.md`.

## Resultado esperado (Definition of Done)
- Sin `any` explícitos (o solo casos justificados y comentados).
- Sin `console.log` de debug ni `alert()` en la UI.
- El componente admin de productos partido en piezas manejables.
- Repo y scripts coherentes (sin archivos muertos ni configs duplicadas).

---

## Tarea 4.1 — Eliminar `any` + reglas ESLint
**Archivos:** `types/*` (nuevos) + múltiples (37 usos de `any` en 18 archivos) + `eslint.config.mjs`.

- [ ] Crear tipos compartidos en `types/`: `types/product.ts`, `types/category.ts`,
      `types/stock-history.ts` (derivados de los modelos Mongoose).
- [ ] Reemplazar `any` conocidos: `category1Id?: any` (storefront), `historyProduct: any`,
      `history: any[]` (admin/products), `query: any` y `sortOption: any` (rutas de productos).
- [ ] Tipar todos los `catch (error: any)` → `catch (error)` (combina con el helper de F1.4).
- [ ] En `eslint.config.mjs` añadir reglas:
      `@typescript-eslint/no-explicit-any: 'warn'` (subir a `'error'` cuando esté limpio) y
      `no-console: ['warn', { allow: ['warn', 'error'] }]`.
- [ ] Correr `npm run lint` y resolver los avisos restantes.

**Aceptación:** `npm run lint` sin errores; búsqueda de `: any` solo deja casos comentados/justificados.

---

## Tarea 4.2 — Limpiar `console.log` y `alert()`
**Archivos:** `components/CloudinaryUploadWidget.tsx` + ~21 archivos con `console.*`.

- [ ] Quitar `console.log` de debug (p.ej. `CloudinaryUploadWidget.tsx:99`
      `console.log('Upload successful', ...)`).
- [ ] Mantener `console.error` SOLO dentro del helper de errores del servidor (F1.4).
- [ ] Reemplazar los `alert()` del widget (`CloudinaryUploadWidget.tsx:48,62,67,94`) por
      `react-hot-toast` (ya configurado en `app/layout.tsx`).

**Aceptación:** no quedan `console.log` ni `alert()` en código de UI; feedback vía toast.

---

## Tarea 4.3 — Partir el god component admin/products
**Archivo:** `app/admin/products/page.tsx` (712 líneas) → `components/admin/*`.

- [ ] Extraer cada modal a su propio componente bajo `components/admin/`:
      - `ProductFormModal.tsx` (crear/editar producto)
      - `StockAdjustModal.tsx`
      - `StockReduceModal.tsx`
      - `ConfirmModal.tsx` (reutilizable)
      - `StockHistoryModal.tsx`
- [ ] Extraer la tabla/listado a `components/admin/ProductsTable.tsx`.
- [ ] La página queda como contenedor que orquesta estado y composición (idealmente < 200 líneas).
- [ ] Mover métodos que hoy están declarados antes del bloque de `useState` (líneas 28-67) al
      orden lógico tras los hooks.
- [ ] Tipar props de cada componente (sin `any`).

**Aceptación:** misma funcionalidad; `app/admin/products/page.tsx` reducido; modales en archivos propios.

---

## Tarea 4.4 — Limpieza de repo y tooling
**Archivos:** `package.json`, configs PostCSS, raíz del repo, `.gitignore`, `lib/mongodb.ts`.

- [ ] `npm run add-users` apunta a `scripts/add-users.ts` que **no existe**: crear el script
      (análogo a `seed.ts`, añadiendo usuarios desde env) **o** eliminar la entrada de `package.json`.
- [ ] Eliminar el PostCSS duplicado: dejar `postcss.config.mjs` **o** `postcss.config.js`, no ambos.
- [ ] Eliminar `test-connection.js` de la raíz (script de depuración).
- [ ] Añadir `.playwright-mcp/` a `.gitignore`.
- [ ] `lib/mongodb.ts:3`: quitar el `!` redundante de `MONGODB_URI!` ya que hay check explícito
      en las líneas siguientes (menor).

**Aceptación:** `npm run add-users` funciona o no existe; una sola config PostCSS; raíz limpia.

---

## Verificación de la fase (Gate F4)
- [ ] `npm run lint` sin errores (reglas nuevas activas).
- [ ] `npm run build` sin errores.
- [ ] App admin funciona igual tras partir el componente (crear/editar/stock/historial).
- [ ] Sin archivos muertos ni configs duplicadas.

## Al terminar
Actualiza `PROGRESS.md`: marca 4.1–4.4, anota commit/PR, cierra el Gate F4.
