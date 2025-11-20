# API Endpoints Quick Reference

## 🔓 Public Endpoints

### Products
```http
GET /api/products
Query params:
  - search: string (text search)
  - category1: string (MongoDB ObjectId)
  - category2: string (MongoDB ObjectId)
  - category3: string (MongoDB ObjectId)
  - sort: 'newest' | 'price-asc' | 'price-desc' | 'name'

Response: { products: Product[] }
```

```http
GET /api/products/[id]
Response: { product: Product }
```

### Settings
```http
GET /api/admin/settings
Response: { settings: { heroBannerUrl, heroBannerPublicId } }
```

## 🔒 Protected Admin Endpoints

All require valid session (NextAuth JWT)

### Authentication
```http
POST /api/auth/signin
POST /api/auth/signout
GET  /api/auth/session
```

### Products CRUD
```http
GET /api/admin/products
Response: { products: Product[] }

POST /api/admin/products
Body: {
  name: string
  description: string
  price: number
  stock: number
  lowStockThreshold?: number (default: 10)
  images: { url: string, publicId: string, isMain: boolean }[]
  category1Id?: string
  category2Id?: string
  category3Id?: string
}
Response: { product: Product }

GET /api/admin/products/[id]
Response: { product: Product }

PUT /api/admin/products/[id]
Body: Same as POST
Response: { product: Product }

DELETE /api/admin/products/[id]
Response: { message: string }
```

### Stock Management
```http
POST /api/admin/products/[id]/stock
Body: {
  change: number (positive or negative, e.g., +5 or -3)
  reason?: string (default: "Manual Adjustment")
}
Response: { product, previousStock, newStock, change }

GET /api/admin/products/[id]/history
Response: { history: StockHistory[] }
```

### Categories
```http
GET /api/admin/categories
Query params:
  - level: 1 | 2 | 3
  - parentId: string (use 'null' for root level)
Response: { categories: Category[] }

POST /api/admin/categories
Body: {
  name: string
  description?: string
  parentId?: string (null for Level 1)
  level: 1 | 2 | 3
}
Response: { category: Category }
Errors:
  - 400: Level 1 cannot have parent
  - 400: Level 2/3 must have parent
  - 400: Category name already exists at this level

GET /api/admin/categories/[id]
Response: { category: Category }

PUT /api/admin/categories/[id]
Body: {
  name: string
  description?: string
}
Response: { category: Category }
Error:
  - 400: Name already exists at this level

DELETE /api/admin/categories/[id]
Response: { message: string }
Errors:
  - 400: Category has subcategories
  - 400: Category has products assigned
```

### Category Helpers
```http
GET /api/admin/categories/children/[parentId]
parentId can be ObjectId or 'null' for root
Response: { categories: Category[] }
```

### Settings
```http
PUT /api/admin/settings
Body: {
  heroBannerUrl: string
  heroBannerPublicId: string
  deleteOldImage?: boolean
}
Response: { settings: Settings }
```

### Dashboard
```http
GET /api/admin/dashboard
Response: {
  totalProducts: number
  lowStockCount: number
  lowStockProducts: { name, stock, lowStockThreshold }[]
  outOfStockCount: number
  outOfStockProducts: { name }[]
  recentStockChanges: StockHistory[]
}
```

## 📦 TypeScript Interfaces

```typescript
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  images: ProductImage[];
  category1Id?: string;
  category2Id?: string;
  category3Id?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductImage {
  url: string;
  publicId: string;
  isMain: boolean;
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  level: 1 | 2 | 3;
  createdAt: Date;
  updatedAt: Date;
}

interface StockHistory {
  _id: string;
  productId: string;
  previousStock: number;
  newStock: number;
  change: number;
  reason?: string;
  userId: string;
  createdAt: Date;
}

interface Settings {
  _id: string;
  heroBannerUrl?: string;
  heroBannerPublicId?: string;
  updatedAt: Date;
}

interface User {
  _id: string;
  username: string;
  password: string; // bcrypt hashed
  createdAt: Date;
}
```

## 🔑 Authentication Flow

```typescript
// Login
import { signIn } from 'next-auth/react';

await signIn('credentials', {
  username: 'admin',
  password: 'admin',
  redirect: false,
});

// Check session
import { useSession } from 'next-auth/react';

const { data: session, status } = useSession();
// status: 'loading' | 'authenticated' | 'unauthenticated'

// Logout
import { signOut } from 'next-auth/react';

await signOut({ redirect: true, callbackUrl: '/' });

// Server-side session
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## 📊 Common Fetch Examples

### Get all products in a category (with children)
```typescript
const response = await fetch('/api/products?category1=CATEGORY_ID');
const { products } = await response.json();
```

### Get child categories for dropdown
```typescript
const response = await fetch('/api/admin/categories/children/PARENT_ID');
const { categories } = await response.json();
```

### Adjust stock
```typescript
const response = await fetch(`/api/admin/products/${productId}/stock`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ change: 5, reason: 'Restocked' }),
});
const { product, previousStock, newStock } = await response.json();
```

### Create product with images
```typescript
const response = await fetch('/api/admin/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Product Name',
    description: 'Description',
    price: 29.99,
    stock: 100,
    lowStockThreshold: 10,
    images: [
      { url: 'https://...', publicId: 'inventory/xxx', isMain: true },
      { url: 'https://...', publicId: 'inventory/yyy', isMain: false },
    ],
    category1Id: 'LEVEL1_ID',
    category2Id: 'LEVEL2_ID',
    category3Id: 'LEVEL3_ID',
  }),
});
```

## 🎨 Cloudinary Widget Integration

```typescript
import CloudinaryUploadWidget from '@/components/CloudinaryUploadWidget';

<CloudinaryUploadWidget
  onUploadSuccess={({ url, publicId }) => {
    // Add to images array
    setImages([...images, { url, publicId, isMain: false }]);
  }}
  folder="inventory"
  buttonText="Upload Image"
  multiple={true}
/>
```

## 🔍 Error Codes

- `401`: Unauthorized (no session)
- `400`: Bad request (validation error)
- `404`: Resource not found
- `500`: Server error

All error responses: `{ error: string }`
