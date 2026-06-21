# Fase 2 — Cosmético: badge de stock inconsistente en la home

## Context

`app/page.tsx` (líneas ~109-117) usa lógica binaria inline
(`product.stock > 0 ? 'In Stock' : 'Out of Stock'`) y **no considera `lowStockThreshold`**.
Por eso un producto con stock 1 y umbral 10 se muestra "In Stock" en la home pero
"Low Stock" en el listado (`app/products/page.tsx`) y en el detalle
(`app/products/[id]/page.tsx`), que sí tienen lógica de 3 estados.

Decisión de alcance: **arreglo mínimo en un solo archivo** (no se extrae un helper a
`lib/`); la duplicación queda como en las otras dos páginas, que es el estado actual del
proyecto.

## Objetivo

Que el badge de la home muestre los 3 estados (Out of Stock / Low Stock / In Stock) de
forma consistente con el listado y el detalle.

## Archivo a modificar

- `app/page.tsx`

## Cambios (mínimos)

1. Añadir `lowStockThreshold: number;` a la interfaz local `Product` (líneas 7-13). El
   endpoint `/api/products` ya devuelve el campo; solo falta declararlo.
2. Añadir un helper local `getStockStatus(product)` que devuelva `{ text, color }`,
   idéntico al de `app/products/page.tsx` (líneas 133-137):
   - `stock === 0` → `{ 'Out of Stock', 'bg-red-100 text-red-800' }`
   - `stock <= lowStockThreshold` → `{ 'Low Stock', 'bg-yellow-100 text-yellow-800' }`
   - resto → `{ 'In Stock', 'bg-green-100 text-green-800' }`
3. Reemplazar el `<span>` inline del badge (líneas 109-117) por el uso del helper,
   conservando las clases de tamaño actuales (`text-sm px-2 py-1 rounded`).

## Verificación

1. Asegurar que un producto cumpla `0 < stock <= lowStockThreshold`
   (p. ej. "Anillo estrella": stock 1, umbral 3).
2. Ir a `/` (home) → ese producto debe mostrar **"Low Stock"** (amarillo), igual que en
   `/products`.
3. Producto con stock 0 → "Out of Stock"; producto con stock alto → "In Stock".

## Criterios de aceptación

- [ ] El badge de la home coincide con el del listado para el mismo producto.
- [ ] Los tres estados se renderizan con el color correcto.
- [ ] `npx tsc --noEmit` limpio (interfaz `Product` con `lowStockThreshold`).
