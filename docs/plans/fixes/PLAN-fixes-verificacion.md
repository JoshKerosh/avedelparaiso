# Plan: Arreglar hallazgos de la verificación funcional

## Context

Durante una verificación end-to-end con Playwright del admin/tienda de "Ave del Paraíso"
(Next.js 16 + MongoDB) se encontraron dos defectos en `app/admin/products/page.tsx` y
`app/page.tsx`. El objetivo es corregirlos sin alterar el comportamiento existente que ya
funciona (login, dashboard, categorías, settings, ajuste de stock e historial).

Decisiones de alcance confirmadas con el usuario:
- Badge de la home: **arreglo mínimo en `app/page.tsx`** (no crear helper compartido).
- Usuario "Unknown" en historial antiguo: **sin cambios** (es dato histórico; el fallback
  `item.userId?.username || 'Unknown'` ya es correcto).

---

## Fix 1 — Bug real: modal de reducir stock triplicado

**Problema:** Los modales `showReduceModal` ("Reduce Stock") y `showConfirmReduce`
("Confirm Reduction") están renderizados **dentro del `products.map(...)`**, en el `<td>`
de la columna de stock. Con N productos se montan N overlays `fixed inset-0 z-50`
idénticos y apilados. Esto no es solo cosmético: los overlays superpuestos **interceptan
los eventos de puntero**, de modo que el botón Accept de las filas inferiores queda
bloqueado (confirmado en la verificación: solo respondió el modal de la última fila).

**Archivo:** `app/admin/products/page.tsx`

**Cambio:** Mover los dos bloques JSX condicionales fuera del `map`, a nivel de componente,
junto a los otros dos modales que ya están correctamente colocados (`showModal` de
add/edit y `showHistoryModal`), es decir después del `</table>`/contenedor de la tabla y
antes del cierre `</ProtectedRoute>`.

- Bloque a mover 1: `{showReduceModal && reduceProduct && ( ... )}`
- Bloque a mover 2: `{showConfirmReduce && ( ... )}`

Actualmente viven dentro del `<td>` de stock, justo después del botón `−`
(aprox. líneas 384-430 del archivo actual). El botón `−` conserva su
`onClick={() => openReduceModal(product)}`.

**Sin cambios de estado ni handlers:** todo el estado relevante (`showReduceModal`,
`showConfirmReduce`, `reduceProduct`, `reduceAmount`, `reduceReason`, `reduceNotes`) y las
funciones (`openReduceModal`, `handleReduceStock`) ya están a nivel de componente. Solo se
reubica el JSX. Resultado: una sola instancia de cada modal, sin overlays apilados.

**Patrón de referencia (ya correcto en el mismo archivo):** el modal `showModal`
(add/edit) y el `showHistoryModal` están fuera del `map`, como instancia única — replicar
esa ubicación.

---

## Fix 2 — Cosmético: badge de stock inconsistente en la home

**Problema:** `app/page.tsx` (líneas 109-117) usa lógica binaria inline
(`product.stock > 0 ? 'In Stock' : 'Out of Stock'`) y **no considera `lowStockThreshold`**.
Por eso un producto con stock 1 y umbral 10 se muestra "In Stock" en la home pero
"Low Stock" en el listado (`app/products/page.tsx`) y en el detalle
(`app/products/[id]/page.tsx`), que sí tienen lógica de 3 estados.

**Archivo:** `app/page.tsx`

**Cambios (mínimos, un solo archivo):**
1. Añadir `lowStockThreshold: number;` a la interfaz local `Product` (líneas 7-13). El
   endpoint `/api/products` ya devuelve este campo; solo falta declararlo.
2. Añadir un helper local `getStockStatus(product)` que devuelva `{ text, color }` con los
   tres estados, idéntico al de `app/products/page.tsx` (líneas 133-137) para mantener
   consistencia visual (Out of Stock = rojo, Low Stock = amarillo, In Stock = verde).
3. Reemplazar el `<span>` inline del badge (líneas 109-117) por el uso del helper,
   conservando las clases de tamaño actuales (`text-sm px-2 py-1 rounded`).

Nota: se mantiene el arreglo mínimo solicitado (no se extrae a `lib/`); la duplicación del
helper queda igual que en las otras dos páginas, que es el estado actual del proyecto.

---

## No-op confirmados (sin cambios de código)

- **Usuario "Unknown" en historial:** dato histórico con `userId` huérfano; el fallback ya
  es correcto.
- Las pruebas de verificación agregaron 2 entradas al historial de "Anillo estrella"
  (+1 y −1); el stock quedó en su valor original (1). No requiere acción.

---

## Verificación

Servidor de dev ya corriendo en http://localhost:3000 (sesión admin activa). Con Playwright:

**Fix 1 (modal):**
1. Ir a `/admin/products`.
2. Clic en `−` de la **primera** fila → el modal "Reduce Stock" aparece **una sola vez**
   (en snapshots previos aparecía repetido en cada fila).
3. Accept → modal "Confirm Reduction" aparece una vez y el botón Confirm responde sin
   interceptación de puntero.
4. Confirmar → el stock baja en 1 y se cierra el modal.
5. Repetir el `−` en otra fila para confirmar que ya no hay overlays apilados.
6. (Opcional) revertir con `+` para restaurar el stock.

**Fix 2 (badge):**
1. Asegurar que algún producto tenga `stock <= lowStockThreshold` y `stock > 0`
   (p. ej. "Anillo estrella": stock 1, umbral 3).
2. Ir a `/` (home) → ese producto debe mostrar **"Low Stock"** (amarillo), igual que en
   `/products`. Producto con stock 0 → "Out of Stock"; stock alto → "In Stock".

**Type-check / lint:**
- `npx tsc --noEmit` debe salir limpio (exit 0).
- `npm run lint`.

---

## Archivos a modificar

- `app/admin/products/page.tsx` — reubicar los 2 modales fuera del `map` (Fix 1).
- `app/page.tsx` — interfaz + helper `getStockStatus` + badge (Fix 2).
