# Fase 2 — Integridad de datos

> **Objetivo:** garantizar que las escrituras dejan datos consistentes y validados.
> **Prerrequisito:** Fase 1 cerrada. **Estado:** ver `PROGRESS.md`. PR independiente.

## Resultado esperado (Definition of Done)
- El stock y su registro de auditoría (`StockHistory`) nunca quedan desincronizados.
- Las escrituras rechazan entradas inválidas con **400** (no 500 por excepción de Mongoose).

---

## Tarea 2.1 — Transacción stock + StockHistory
**Archivo:** `app/api/admin/products/[id]/stock/route.ts` · **Riesgo:** si `StockHistory.create`
falla tras `product.save()`, el stock cambia sin auditoría.

- [ ] Validar `change` antes de operar: `typeof change === 'number' && Number.isFinite(change)`;
      si no, devolver 400 `{ error: 'change must be a finite number' }`.
- [ ] Envolver ambas escrituras en una transacción Mongo:
      ```ts
      import mongoose from 'mongoose';
      const dbSession = await mongoose.startSession();
      try {
        await dbSession.withTransaction(async () => {
          product.stock = newStock;
          await product.save({ session: dbSession });
          await StockHistory.create([{
            productId: id, previousStock, newStock, change,
            reason: reason || 'Manual Adjustment', notes: notes || '',
            userId: session.user.id,
          }], { session: dbSession });
        });
      } finally {
        await dbSession.endSession();
      }
      ```
- [ ] Mantener la validación de stock negativo existente (`newStock < 0` → 400).
- [ ] **Verificar el entorno de Mongo:** las transacciones requieren replica set.
      - MongoDB Atlas → OK por defecto.
      - Mongo standalone local → documentar y usar fallback: try/catch que escribe history y,
        si falla, revierte `product.stock` al valor previo manualmente.
- [ ] Anotar en `PROGRESS.md` qué entorno usa el proyecto (Atlas vs standalone).

**Aceptación:** simular fallo en la escritura de history (p.ej. forzar error) → el stock del
producto NO cambia. Ajuste normal → stock + history consistentes.

---

## Tarea 2.2 — Validación de entrada (Zod) en escrituras
**Archivos:** nuevo `lib/validation/*` + `app/api/admin/products/route.ts` +
`app/api/admin/products/[id]/route.ts` + `app/api/admin/categories/route.ts`.

- [ ] `npm i zod`.
- [ ] Crear `lib/validation/product.ts` con un schema:
      `name` string no vacío, `description` string, `price` number ≥ 0,
      `stock` int ≥ 0, `lowStockThreshold` int ≥ 0 (default 10),
      `images` array (objetos `{ url, publicId, isMain }`), `category{1,2,3}Id` opcionales.
- [ ] Crear `lib/validation/category.ts`: `name` string no vacío, `description` string opcional,
      `level ∈ {1,2,3}`, `parentId` opcional/null.
- [ ] En `POST`/`PUT` de productos: parsear el body con `schema.safeParse`; si falla,
      devolver 400 con el primer mensaje de error (no la excepción cruda).
- [ ] En `categories`: validar `name` ANTES de `.trim()` (hoy puede lanzar 500 si es undefined).
- [ ] Mantener `runValidators: true` en los `findByIdAndUpdate` existentes.
- [ ] Reusar estos schemas en los tests de la Fase 5.1.

**Aceptación:** `POST /api/admin/products` con `price: -5` o `name: ""` → 400 con mensaje claro,
no 500.

---

## Tarea 2.3 — Decisión búsqueda `$regex` vs `$text`
**Archivo:** `app/api/products/route.ts` (líneas ~20-24) · **Contexto:** existe índice `$text`
en `models/Product.ts` pero la búsqueda usa `$regex` (no usa índice; no aprovecha el text index).

- [ ] Decidir y documentar en `PROGRESS.md`:
      - **Opción A (recomendada, bajo riesgo):** mantener `$regex` para soportar substring
        parcial; documentar que el índice text queda sin uso (o eliminarlo si no se usará).
      - **Opción B:** migrar a `$text` para usar el índice (mejor a escala) aceptando que solo
        matchea palabras completas/stemmed, no substrings.
- [ ] Aplicar la opción elegida (si es A, posiblemente solo documentar/eliminar índice muerto).

**Aceptación:** comportamiento de búsqueda documentado y coherente con el índice declarado.

---

## Verificación de la fase (Gate F2)
- [ ] Ajustar stock con `change` no numérico → 400.
- [ ] Fallo simulado en StockHistory → stock no cambia.
- [ ] Crear producto/categoría inválidos → 400 (no 500).
- [ ] `npm run lint` y `npm run build` sin errores.

## Patrones a reutilizar
- `await connectDB()` antes de cada query.
- Modelos vía default export (`models.X || model(...)`).
- Helper de errores de la Fase 1.4 para los `catch`.

## Al terminar
Actualiza `PROGRESS.md`: marca 2.1–2.3, anota el entorno Mongo y la decisión de búsqueda,
cierra el Gate F2.
