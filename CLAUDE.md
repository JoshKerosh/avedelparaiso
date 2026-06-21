# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run start      # Serve production build
npm run lint       # ESLint (eslint-config-next)
npm run seed       # Seed admin user (admin/admin) + default Settings doc
npm run add-users  # Add additional users (scripts/add-users.ts)
```

There is no test suite. Scripts run via `tsx` and load `.env.local` themselves (see `scripts/seed.ts`).

## Required environment (`.env.local`)

- `MONGODB_URI` — MongoDB connection string (required; throws on import if missing)
- `NEXTAUTH_SECRET` — NextAuth JWT signing secret
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — required (`lib/cloudinary.ts` throws if missing)
- `CLOUDINARY_UPLOAD_PRESET` — used by the client upload widget

## Architecture

E-commerce catalog + inventory admin for "Ave del Paraíso". **Next.js 16 App Router**, React 19 (React Compiler enabled via `babel-plugin-react-compiler`), MongoDB/Mongoose, NextAuth (credentials), Cloudinary for images, Tailwind 3 with dark mode. Deployed on Vercel. Path alias `@/*` maps to repo root.

### Two surfaces
- **Public storefront** — `app/page.tsx` (home/hero), `app/products`, `app/products/[id]`. Reads via public API routes under `app/api/products`.
- **Admin panel** — everything under `app/admin/*` (dashboard, products, categories, settings) backed by `app/api/admin/*`. Login at `app/admin/login`.

### Auth
- NextAuth Credentials provider in `app/api/auth/[...nextauth]/route.ts`. JWT sessions (24h). Passwords are bcrypt-hashed in the `User` model.
- `authOptions` is exported from that route file and imported elsewhere — **server-side** admin routes guard with `getServerSession(authOptions)` and return 401 when absent. Routes that write StockHistory also require `session.user.id`.
- **Client-side** admin pages wrap content in `components/ProtectedRoute.tsx`, which redirects unauthenticated users to `/admin/login`. `hooks/useIsAdmin.ts` exposes admin state to UI.
- Session type augmentation (adds `user.id`) lives in `types/next-auth.d.ts`.

### Database
- Mongoose connection is cached on `global.mongoose` (`lib/mongodb.ts`) to survive hot reloads / serverless reuse. **Every route handler must `await connectDB()` before querying.**
- Models in `models/` use the `models.X || model('X', schema)` pattern to avoid recompilation errors. Always import the default export, never re-`model()`.
- **Category hierarchy is 3 levels deep** (`level: 1|2|3`, self-referencing `parentId`). Products reference up to three categories via `category1Id`/`category2Id`/`category3Id` (one per level). Admin routes `populate` these.
- **Stock changes are audited**: never mutate `Product.stock` directly in a feature without writing a `StockHistory` record (see `app/api/admin/products/[id]/stock/route.ts`). History is also exposed at `.../[id]/history`.
- `Settings` is a singleton doc (hero banner). Seeded by `npm run seed`.

### Images (Cloudinary)
- Server SDK configured in `lib/cloudinary.ts`. Client uploads go through `components/CloudinaryUploadWidget.tsx`, signed by `app/api/upload/signature/route.ts`.
- Products store an array of `{ url, publicId, isMain }`. The product POST route enforces that at least one image is `isMain`. `publicId` is needed to delete from Cloudinary on product/image removal.

### Conventions
- API routes are thin: `getServerSession` guard (admin) → `connectDB()` → Mongoose op → `NextResponse.json`. Errors caught and returned as `{ error }` with appropriate status.
- Dynamic route params are async in Next 16: `{ params }: { params: Promise<{ id: string }> }`, then `const { id } = await params`.
- Client components use `'use client'`. Providers (`SessionProvider`, `ThemeProvider`, react-hot-toast `Toaster`) are set up in `app/layout.tsx`. Toasts via `react-hot-toast`; theming via `next-themes` (class strategy, dark mode default).
