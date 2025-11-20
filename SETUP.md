# Ave del Paraíso - Setup Instructions

## ✅ What's Been Created

Your inventory management system now has:

### Backend Infrastructure:
- MongoDB connection with Mongoose models
- NextAuth authentication system
- Cloudinary image management
- Complete API routes for products, categories, settings, and dashboard
- Database seeding script

### Frontend:
- Landing page with hero banner and featured products
- Navigation layout with SessionProvider and Toaster
- Cloudinary Upload Widget component

## 🔧 Required Configuration

### 1. Update `.env.local`

Replace these placeholders:

```env
# Add your MongoDB password
MONGODB_URI=mongodb+srv://Joshua:YOUR_PASSWORD_HERE@mymongodb.hteve5f.mongodb.net/inventory?retryWrites=true&w=majority

# Create unsigned preset in Cloudinary and add name here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=inventory-upload

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=generate-a-secure-secret-here
```

### 2. Create Cloudinary Unsigned Preset

1. Login to Cloudinary: https://cloudinary.com/console
2. Go to Settings → Upload → Add upload preset
3. Settings:
   - Signing Mode: **Unsigned**
   - Preset name: **inventory-upload** (or your choice)
   - Folder: **inventory**
   - Max file size: **5MB**
   - Allowed formats: jpg, jpeg, png, webp, gif
4. Save and copy the preset name to `.env.local`

### 3. Seed the Database

```bash
npm run seed
```

Creates admin user (username: **admin**, password: **admin**)

### 4. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## 📋 Remaining Pages to Create

You need to create these frontend pages to complete the application:

### Required Pages:

1. **`app/admin/login/page.tsx`** - Login form
2. **`app/admin/page.tsx`** - Admin dashboard with stats
3. **`app/admin/products/page.tsx`** - Product management page
4. **`app/admin/categories/page.tsx`** - Category management with tree view
5. **`app/admin/settings/page.tsx`** - Hero banner settings
6. **`app/products/page.tsx`** - Product catalog with filters
7. **`app/products/[id]/page.tsx`** - Product detail page with carousel

### Helpful Components to Create:

**`components/ProtectedRoute.tsx`** - Wraps admin pages:
```typescript
'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return null;
  return <>{children}</>;
}
```

**`components/ImageCarousel.tsx`** - For product details:
```typescript
'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function ImageCarousel({ images }: { images: { url: string }[] }) {
  const [current, setCurrent] = useState(0);
  
  return (
    <div>
      <div className="relative h-96">
        <Image src={images[current]?.url} alt="Product" fill className="object-cover" />
      </div>
      <div className="flex gap-2 mt-4">
        {images.map((img, i) => (
          <button key={i} onClick={() => setCurrent(i)} 
            className={`relative h-20 w-20 ${i === current ? 'ring-2 ring-blue-600' : ''}`}>
            <Image src={img.url} alt={`Thumb ${i}`} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
```

## 📊 API Routes Available

### Public:
- `GET /api/products` - List with filters (search, category1/2/3, sort)
- `GET /api/products/[id]` - Single product
- `GET /api/admin/settings` - Hero banner

### Protected (require session):
- **Products**: GET/POST `/api/admin/products`, GET/PUT/DELETE `/api/admin/products/[id]`
- **Stock**: POST `/api/admin/products/[id]/stock`, GET `/api/admin/products/[id]/history`
- **Categories**: GET/POST `/api/admin/categories`, GET/PUT/DELETE `/api/admin/categories/[id]`
- **Category Children**: GET `/api/admin/categories/children/[parentId]`
- **Settings**: PUT `/api/admin/settings`
- **Dashboard**: GET `/api/admin/dashboard`

## 🎯 Key Features

- **3-Level Category Hierarchy**: Products can have Category1 → Category2 → Category3
- **Unique Category Names**: Within same parent level only
- **Stock History Tracking**: All adjustments logged with user, timestamp, reason
- **Image Management**: Multiple images per product, designate one as main
- **Category Filtering**: Shows selected level + all children products
- **Deletion Protection**: Can't delete categories with products or subcategories

## 🚀 Quick Start Workflow

1. Seed database: `npm run seed`
2. Start server: `npm run dev`
3. Login: http://localhost:3000/admin/login (admin/admin)
4. Upload hero banner in Settings
5. Create 3-level categories
6. Add products with images
7. Manage stock with +/- buttons
8. View public site at root URL

## 📁 Project Structure

```
app/
├── api/
│   ├── auth/[...nextauth]/route.ts
│   ├── products/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   └── admin/
│       ├── products/
│       ├── categories/
│       ├── settings/route.ts
│       └── dashboard/route.ts
├── layout.tsx
└── page.tsx (landing page)

components/
└── CloudinaryUploadWidget.tsx

lib/
├── mongodb.ts
└── cloudinary.ts

models/
├── User.ts
├── Product.ts
├── Category.ts
├── StockHistory.ts
└── Settings.ts

scripts/
└── seed.ts
```

## ⚠️ Important Notes

1. **MongoDB Password**: Replace `YOUR_PASSWORD_HERE` in `.env.local`
2. **Cloudinary Preset**: Must create unsigned preset in dashboard
3. **Change Default Password**: After first login, update admin password
4. **Security**: Generate strong NEXTAUTH_SECRET for production
5. **Network Access**: Configure MongoDB Atlas IP whitelist

## 🐛 Troubleshooting

**MongoDB Connection Error**:
- Check password in MONGODB_URI
- Verify IP whitelist in MongoDB Atlas (try 0.0.0.0/0 for development)

**Cloudinary Upload Error**:
- Verify preset is "Unsigned" mode
- Check NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET matches preset name

**Auth Not Working**:
- Clear browser cookies
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain

Need help? Review the API route files for request/response formats.
