# Fase 5 — Tests + CI + Docs

> **Objetivo:** red de seguridad mínima (tests automatizados), verificación continua (CI) y
> documentación útil. **Estado:** ver `PROGRESS.md`.
> **Nota de orden:** la tarea **5.2 (CI) conviene hacerla temprano** — justo tras la Fase 1 —
> para que `lint`/`build` protejan las fases siguientes. 5.1 y 5.3 al final.

## Resultado esperado (Definition of Done)
- `npm test` ejecuta tests de la lógica crítica y pasa.
- CI corre `lint + build + test` en cada push/PR y queda verde.
- README documenta proyecto, stack, env vars, comandos y nota de seguridad.

---

## Tarea 5.1 — Vitest + tests prioritarios
**Archivos:** nuevos `vitest.config.ts`, `tests/**` + `package.json`.

- [ ] `npm i -D vitest @vitest/coverage-v8 mongodb-memory-server`.
- [ ] Crear `vitest.config.ts` con alias `@/*` (resolver de `tsconfig`) y entorno `node`.
- [ ] Añadir scripts: `"test": "vitest run"`, `"test:watch": "vitest"`,
      `"test:cov": "vitest run --coverage"`.
- [ ] Tests prioritarios:
      - [ ] `buildProductQuery` (de `lib/products.ts`, F3.1): cubre filtros nivel 1/2/3 + search.
      - [ ] Helpers `lib/product-ui.ts`: `getStockStatus` (out/low/in stock), `getMainImage`
            (main, fallback primera imagen, placeholder).
      - [ ] Schemas Zod de validación (F2.2): casos válidos e inválidos (price negativo,
            name vacío, level fuera de {1,2,3}).
      - [ ] Lógica de stock (con `mongodb-memory-server`): rechazo de negativo, escritura de
            StockHistory, rechazo de `change` no numérico, consistencia tras la transacción.
      - [ ] Guards de auth: rutas admin devuelven 401 sin sesión (mock de `getServerSession`).
- [ ] Asegurar que los tests no requieran red real (DB en memoria, Cloudinary mockeado).

**Aceptación:** `npm test` pasa en local; cobertura razonable de query builder, validación y stock.

---

## Tarea 5.2 — GitHub Actions CI  ⏫ (hacer temprano)
**Archivo:** nuevo `.github/workflows/ci.yml`.

- [ ] Workflow disparado en `push` y `pull_request`.
- [ ] Pasos: `actions/checkout` → `actions/setup-node@v4` (Node 20, `cache: npm`) →
      `npm ci` → `npm run lint` → `npm run build` → `npm test`.
- [ ] Proveer variables de entorno DUMMY en el step de build/test para que no fallen los checks
      de env (`MONGODB_URI`, `NEXTAUTH_SECRET`, `CLOUDINARY_*`) — valores ficticios suficientes
      para que `lib/mongodb.ts`/`lib/cloudinary.ts` no lancen en import.
- [ ] Confirmar que `build` no intenta conexión real a Mongo en tiempo de build.

**Aceptación:** un PR de prueba muestra el workflow en verde.

---

## Tarea 5.3 — README real
**Archivo:** `README.md` (hoy boilerplate de create-next-app con "Deployment trigger" pegado).

- [ ] Reescribir con: descripción del proyecto ("Ave del Paraíso", catálogo + admin de inventario),
      stack (Next 16, React 19, Mongoose, NextAuth, Cloudinary, Tailwind).
- [ ] Requisitos y **variables de entorno** (las de `CLAUDE.md`: `MONGODB_URI`,
      `NEXTAUTH_SECRET`, `CLOUDINARY_*`, `CLOUDINARY_UPLOAD_PRESET`, y las nuevas de F1:
      `SEED_ADMIN_USER`, `SEED_ADMIN_PASSWORD`, `SEED_TOKEN` si aplica).
- [ ] Comandos: `dev`, `build`, `start`, `lint`, `seed`, `test`, `test:watch`.
- [ ] **Nota de seguridad:** rotar la password admin tras el primer login; el seed ya no corre por HTTP.
- [ ] Cómo correr los tests y dónde ver cobertura.
- [ ] Enlazar docs existentes: `SETUP.md`, `DEPLOYMENT_GUIDE.md`, `API_REFERENCE.md`,
      `PROJECT_REFERENCE.md`, `docs/CODING_STANDARDS.md`, y este plan (`docs/plan/`).

**Aceptación:** un dev nuevo puede levantar el proyecto siguiendo solo el README.

---

## Verificación de la fase (Gate F5)
- [ ] `npm test` en verde local.
- [ ] CI en verde en un PR.
- [ ] README permite onboarding sin ayuda externa.

## Al terminar
Actualiza `PROGRESS.md`: marca 5.1–5.3, cierra el Gate F5 y repasa el
**Checklist de "Producción lista"** del final de `PROGRESS.md`.
