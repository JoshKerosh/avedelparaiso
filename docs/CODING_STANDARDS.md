# Coding Standards & Conventions

There is no enforced style guide (only `next lint` / `eslint-config-next` runs). The
rules below are the **de-facto conventions** observed consistently across the codebase.
Follow them when adding code so new work matches what's already here.

---

## 1. Language & tooling

- **TypeScript, `strict: true`**, no emit (`next build` / `tsc` for type-checking).
- Import using the **`@/*` path alias** (maps to repo root) for anything outside the
  current folder — e.g. `import connectDB from '@/lib/mongodb'`. Relative imports are
  only used inside `scripts/` (which run via `tsx`).
- React 19 with the **React Compiler** enabled — do **not** hand-add `useMemo`/
  `useCallback` for micro-optimizations; the compiler handles memoization.
- Tailwind CSS for all styling. No CSS modules, no inline styles (except dynamic
  values like a computed border color).

## 2. Mongoose models (`models/`)

- One model per file, **default-exported** with the recompilation guard:
  ```ts
  export default models.Product || model<IProduct>('Product', ProductSchema);
  ```
  Never call `model()` again elsewhere — always import the default export.
- Each model declares a TypeScript interface prefixed with **`I`** (`IProduct`,
  `ICategory`, `IStockHistory`, `ISettings`).
- Use `{ timestamps: true }` for `createdAt`/`updatedAt` unless the doc manages its
  own dates (e.g. `StockHistory` uses an explicit `createdAt`).
- Declare indexes on the schema for any field used in queries/filters.
- References between collections use `Schema.Types.ObjectId` with `ref`.

## 3. API route handlers (`app/api/**/route.ts`)

Keep handlers thin and follow this exact shape:

```ts
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);      // admin routes only
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();                                          // ALWAYS before any query
    const body = await request.json();
    // ...mongoose work...
    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

- **Every handler must `await connectDB()`** before touching the database.
- **`app/api/admin/*` routes are protected** with `getServerSession(authOptions)` and
  return `401 { error: 'Unauthorized' }` when there's no session. Routes that write
  `StockHistory` additionally require `session.user.id`.
- Public routes live under `app/api/products` and have no session guard.
- Wrap the body in `try/catch (error: any)`, `console.error` with a descriptive
  prefix, and return `{ error: error.message }` with an appropriate status.
- Success responses return a **named object** (`{ products }`, `{ product }`,
  `{ categories }`, `{ history }`), not a bare array.
- Next 16 dynamic params are async:
  ```ts
  { params }: { params: Promise<{ id: string }> }
  const { id } = await params;
  ```

## 4. Stock mutation rule (domain invariant)

Never write `product.stock` directly in a feature. All stock changes go through
`POST /api/admin/products/[id]/stock`, which:
1. validates the new stock is not negative,
2. saves the product, and
3. **creates a `StockHistory` record** (previousStock, newStock, change, reason,
   notes, userId).

Reasons are a fixed set: `SALE | DAMAGED | ADJUSTMENT | OTHER` (default
`'Manual Adjustment'`).

## 5. React pages & components

- Client components / pages start with **`'use client'`**. Providers
  (`SessionProvider`, `ThemeProvider`, `Toaster`) are set up once in
  `app/layout.tsx`.
- Admin pages wrap their content in **`<ProtectedRoute>`** for client-side redirect.
- **Data fetching pattern** inside pages: `useEffect` → `fetch` → check
  `response.ok` → `setState(data.x || [])` → `finally { setLoading(false) }`.
  Define a local interface for the fetched shape at the top of the file.
- **Forms** use a single `formData` state object updated with
  `setFormData({ ...formData, field: value })` or a functional updater. Numeric
  inputs are kept as strings in state and converted with `parseFloat`/`parseInt`
  on submit.
- **User feedback** uses `react-hot-toast`: `toast.success(...)` / `toast.error(data.error || 'fallback')`.
  Destructive actions confirm with the native `confirm(...)` or a confirmation modal.
- **Modals** are conditionally rendered with a `show*` boolean, a fixed overlay
  (`fixed inset-0 bg-black bg-opacity-50 ... z-50`), close on backdrop click /
  Escape, and `stopPropagation` on the inner panel.

## 6. Styling conventions

- **Always pair light and dark classes**: `text-gray-900 dark:text-white`,
  `bg-white dark:bg-gray-800`, etc. Dark mode is class-based (`next-themes`) and is
  expected everywhere.
- Page container pattern: `min-h-screen bg-gray-50 dark:bg-gray-900` →
  `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`.
- Primary action color is **blue-600** (hover `blue-700`); destructive is **red-600**;
  inputs use `focus:ring-2 focus:ring-blue-500`.

## 7. Domain formatting

- Prices are Costa Rican colón. Format consistently as:
  ```ts
  ₡{price.toLocaleString('es-CR', { maximumFractionDigits: 0 })}
  ```
- The **3-level category hierarchy** is rendered as cascading selects: selecting a
  parent fetches its children via
  `GET /api/admin/categories/children/[parentId]` and clears the deeper selections.

## 8. Cloudinary images

- Products hold an array of `{ url, publicId, isMain }`. Exactly one image is `isMain`
  — UI/back-end both enforce defaulting the first image to main when none is set.
- Keep `publicId` so the image can be deleted from Cloudinary on removal.
- Client uploads use `<CloudinaryUploadWidget>` (folder e.g. `inventory/products`),
  signed by `POST /api/upload/signature`.

---

## Known inconsistencies (clean up when you touch nearby code)

These exist today and do **not** represent the intended standard:

- **Mixed English/Spanish** in comments and some UI strings (e.g. the reduce-stock
  modal logic in `app/admin/products/page.tsx`). Prefer English in code/comments.
- `app/admin/products/page.tsx` has **duplicate `interface Category` definitions** and
  a leftover `// ...existing code...` marker, plus irregular indentation at the top of
  the component. Modal JSX is also nested inside a table cell rather than hoisted.
- Liberal use of **`any`** (`category1Id?: any`, `historyProduct`, `history`) in some
  page components — prefer real types.
- No automated tests exist.
