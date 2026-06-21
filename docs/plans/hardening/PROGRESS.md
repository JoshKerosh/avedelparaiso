# PROGRESS — Plan de endurecimiento Ave del Paraíso

> Archivo maestro de seguimiento. **Actualízalo al cerrar cada tarea.** Cada fase vive en
> su propio archivo (`PHASE_1_SECURITY.md` … `PHASE_5_TESTS_CI_DOCS.md`). El contexto y la
> justificación global están en `../HARDENING_PLAN.md`.

## Cómo usar este archivo
1. Antes de empezar una tarea, ponla `🟡 En progreso` y anota la fecha.
2. Al terminar, márcala `✅ Hecho`, anota el commit/PR y cualquier desviación.
3. Si algo se bloquea, ponla `⛔ Bloqueada` y escribe el motivo en **Notas**.
4. No saltes fases sin cerrar sus *gates*. El orden de ejecución es deliberado (riesgo primero).

**Leyenda de estado:** ⬜ Pendiente · 🟡 En progreso · ✅ Hecho · ⛔ Bloqueada · ⏭️ Omitida

---

## Resumen global

| Fase | Archivo | Foco | Estado | Avance |
|------|---------|------|--------|--------|
| 1 | `PHASE_1_SECURITY.md` | Seguridad crítica | ✅ | 6/6 |
| 2 | `PHASE_2_DATA_INTEGRITY.md` | Integridad de datos | ✅ | 3/3 |
| 3 | `PHASE_3_SSR.md` | Storefront SSR + paginación | ✅ | 4/4 |
| 4 | `PHASE_4_CODE_QUALITY.md` | Calidad de código | ✅ | 4/4 |
| 5 | `PHASE_5_TESTS_CI_DOCS.md` | Tests + CI + Docs | ✅ | 3/3 |

**Orden de ejecución recomendado:** F1 → F2 → F5.2 (CI temprano) → F3 → F4 → F5.1/5.3.
Cada fase es un commit/PR independiente y desplegable.

> ✅ **TODAS LAS FASES COMPLETADAS (2026-06-21).** Verificación final: `tsc --noEmit` 0
> errores · `npm run lint` 0 errores (2 warnings advisory `set-state-in-effect`) ·
> `npm test` 25/25 · `npm run build` verde. Pendiente único: hacer commit/PR (la columna
> "Commit/PR" sigue como "(pendiente)" porque no se ha commiteado todavía).

---

## Detalle de tareas

### Fase 1 — Seguridad crítica
| ID | Tarea | Estado | Commit/PR | Fecha |
|----|-------|--------|-----------|-------|
| 1.1 | Neutralizar `/api/seed` | ✅ | (pendiente) | 2026-06-20 |
| 1.2 | Rotar credenciales admin | ✅ | (pendiente) | 2026-06-20 |
| 1.3 | Auth en `/api/upload/signature` | ✅ | (pendiente) | 2026-06-20 |
| 1.4 | Helper de errores (no filtrar `error.message`) | ✅ | (pendiente) | 2026-06-20 |
| 1.5 | `middleware.ts` para `/admin` | ✅ | (pendiente) | 2026-06-20 |
| 1.6 | Rate limiting básico | ✅ | (pendiente) | 2026-06-20 |

**Gate F1:** ningún endpoint público crea datos; subida requiere sesión; sin fuga de
internals; `/admin` protegido; login con rate limit. → ver checklist al final de la fase.

### Fase 2 — Integridad de datos
| ID | Tarea | Estado | Commit/PR | Fecha |
|----|-------|--------|-----------|-------|
| 2.1 | Transacción stock + StockHistory | ✅ | (pendiente) | 2026-06-20 |
| 2.2 | Validación de entrada (Zod) en escrituras | ✅ | (pendiente) | 2026-06-20 |
| 2.3 | Decisión búsqueda `$regex` vs `$text` | ✅ | (pendiente) | 2026-06-20 |

**Gate F2:** stock nunca se desincroniza de su auditoría; entradas inválidas → 400.

### Fase 3 — Storefront SSR + paginación
| ID | Tarea | Estado | Commit/PR | Fecha |
|----|-------|--------|-----------|-------|
| 3.1 | Capa de datos server-side (`lib/products.ts`) | ✅ | (pendiente) | 2026-06-20 |
| 3.2 | Paginación en data layer + API | ✅ | (pendiente) | 2026-06-20 |
| 3.3 | Migrar home/listado/detalle a Server Components + metadata | ✅ | (pendiente) | 2026-06-20 |
| 3.4 | Estados loading/error + utilidades compartidas | ✅ | (pendiente) | 2026-06-20 |

**Gate F3:** storefront SSR (HTML con productos en view-source), paginado, con skeletons.

### Fase 4 — Calidad de código
| ID | Tarea | Estado | Commit/PR | Fecha |
|----|-------|--------|-----------|-------|
| 4.1 | Eliminar `any` + reglas ESLint | ✅ | (pendiente) | 2026-06-21 |
| 4.2 | Limpiar `console.log` y `alert()` | ✅ | (pendiente) | 2026-06-21 |
| 4.3 | Partir god component admin/products | ✅ | (pendiente) | 2026-06-21 |
| 4.4 | Limpieza de repo y tooling | ✅ | (pendiente) | 2026-06-21 |

**Gate F4:** sin `any` ni `console.log` de debug; componentes razonables; repo limpio.

### Fase 5 — Tests + CI + Docs
| ID | Tarea | Estado | Commit/PR | Fecha |
|----|-------|--------|-----------|-------|
| 5.1 | Vitest + tests prioritarios | ✅ | (pendiente) | 2026-06-21 |
| 5.2 | GitHub Actions CI | ✅ | (pendiente) | 2026-06-21 |
| 5.3 | README real | ✅ | (pendiente) | 2026-06-21 |

**Gate F5:** `npm test` y CI en verde; README útil; onboarding claro.

---

## Bitácora / Notas
> Registra aquí decisiones, desviaciones del plan, bloqueos y aprendizajes. Formato:
> `YYYY-MM-DD — [ID] nota`.

- 2026-06-20 — [F1] Fase 1 completa. Nuevos: `lib/apiError.ts`, `lib/rateLimit.ts`,
  `middleware.ts`, `scripts/seed-test-data.ts`. `/api/seed` eliminado. `error.message`
  reemplazado por `handleApiError` en todas las rutas. Rate limit en login (10/min/IP) y
  upload-signature (30/min/IP). `seed.ts` ya no hardcodea admin/admin (env + password
  aleatoria). Verificado: `tsc --noEmit` limpio, `npm run build` verde, middleware activo.
- 2026-06-20 — [tooling] `npm run lint` (`next lint`) roto en Next 16 ("Invalid project
  directory ... /lint"). Se valida con `npx eslint` directo. Arreglar en Fase 4/5.
- 2026-06-20 — [F4-deuda] 5 errores `no-explicit-any` PRE-EXISTENTES en rutas de productos/
  categorías (query/sortOption/img). Pendientes para Fase 4.1. (Los `img: any` ya se
  eliminaron al introducir Zod en F2.2; quedan `query: any` y `sortOption: any`.)
- 2026-06-20 — [F2] Fase 2 completa. Stock ahora transaccional (`withTransaction`) con
  fallback compensado para Mongo standalone; `change` validado como número finito. Zod
  (`lib/validation/*`) en POST/PUT de productos y categorías → 400 limpio en vez de 500.
  [F2.3] Decisión: se MANTIENE `$regex` para búsqueda por substring parcial (mejor UX); el
  índice `$text` de Product queda sin uso (no se elimina por ahora; reevaluar a escala).
  Verificado: `tsc --noEmit` limpio, `npm run build` verde.
- 2026-06-20 — [F3] Fase 3 completa. Nuevos: `types/product.ts`, `lib/product-ui.ts`,
  `lib/products.ts` (buildProductQuery/getProducts/getProductById/getRootCategories/
  getChildCategories/getSettings), `components/ProductCard.tsx` (server),
  `components/ProductFilters.tsx` (client, escribe filtros a la URL), `app/loading.tsx`,
  `app/products/loading.tsx`, `app/products/[id]/loading.tsx`, `app/error.tsx`,
  `app/not-found.tsx`. home/listado/detalle reescritos como Server Components con
  `generateMetadata`/metadata SEO y paginación por URL. `/api/products` ahora usa
  `getProducts` (devuelve `{products,total,page,totalPages}`). home con
  `dynamic='force-dynamic'`. Build: `/`, `/products`, `/products/[id]` son ƒ (SSR).
  Verificado: tsc limpio, build verde, eslint de archivos nuevos limpio.
- 2026-06-20 — [entorno] PENDIENTE confirmar si MONGODB_URI es Atlas (soporta transacciones)
  o standalone. El código funciona en ambos por el fallback, pero conviene anotarlo.
- 2026-06-21 — [F4] Fase 4 completa. Todos los `any` eliminados (widget Cloudinary tipado,
  `query`/`recentStockChanges`/`historyProduct`/`history`/`as any` reduceReason). Reglas
  ESLint: `no-explicit-any` y `no-console` (allow warn/error) en warn; `set-state-in-effect`
  bajado a warn (patrón SSR). `alert()` → `react-hot-toast`; `console.log` debug eliminado.
  God component `app/admin/products/page.tsx` partido (714→~370 líneas) en
  `components/admin/{ProductsTable,ProductFormModal,ReduceStockModal,ConfirmReduceModal,
  StockHistoryModal}.tsx` + `types/admin.ts`. Limpieza: borrado `postcss.config.mjs`
  duplicado, `test-connection.js`, y `contexts/ThemeContext.tsx` (CÓDIGO MUERTO — el theming
  usa next-themes vía `components/ThemeProvider`). Creado `scripts/add-users.ts` funcional.
  `lint` script: `next lint` (roto en Next 16) → `eslint .`. `lib/mongodb.ts` sin `!`.
  Modelos sin import `mongoose` sobrante. Verificado: tsc limpio, `npm run lint` exit 0
  (2 warnings advisory), build verde.
- 2026-06-21 — [F5] Fase 5 completa. Vitest 4 + `@vitest/coverage-v8`; `vitest.config.ts`
  (alias `@`, env dummy MONGODB_URI). 25 tests en `tests/` (product-ui, validación Zod,
  rateLimit, buildProductQuery ramas sin DB). Scripts `test`/`test:watch`/`test:cov`.
  CI en `.github/workflows/ci.yml` (lint→test→build con env dummy, Node 20, `npm ci`).
  README reescrito (stack, env, comandos, nota de seguridad, enlaces a docs).

---

## Checklist de "Producción lista" (todas las fases cerradas)
- [x] No existe ningún endpoint que cree usuarios/datos sin auth. (`/api/seed` eliminado)
- [x] Credenciales por defecto rotadas (seed por env/aleatorio). _Acción del operador:_ cambiar password admin tras primer login.
- [x] Las respuestas de error no exponen stack/detalle de Mongo. (`handleApiError`)
- [x] `/admin` inaccesible sin sesión (`middleware.ts`).
- [x] Stock y StockHistory consistentes ante fallo (transacción + fallback compensado).
- [x] Storefront renderiza en servidor con metadata SEO y paginación.
- [x] `npm run lint`, `npm run build`, `npm test` en verde localmente.
- [ ] CI en verde en PR. _(workflow creado; se valida al abrir el primer PR)_
- [x] README documenta setup, env vars y comandos.

## Pendientes / follow-ups
- Hacer commit y abrir PR (validar CI en verde).
- Confirmar si `MONGODB_URI` es Atlas (transacciones nativas) o standalone (usa fallback).
- Tests de integración con DB (mongodb-memory-server): transacción de stock completa y
  resolución de categorías nivel 1/2 en `buildProductQuery`.
- Operador: cambiar la contraseña admin tras el primer login.
