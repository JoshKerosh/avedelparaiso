import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local FIRST. Static imports are hoisted above this call, so any module
// that reads env at load time (e.g. lib/mongodb.ts) must be imported dynamically
// below — after env is populated.
config({ path: resolve(process.cwd(), '.env.local') });

// Fixed USD -> CRC exchange rate used only to generate sample prices.
const USD_TO_CRC = 500;

async function seedTestData() {
  const { default: connectDB } = await import('../lib/mongodb');
  const { default: Category } = await import('../models/Category');
  const { default: Product } = await import('../models/Product');

  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected successfully!');

    // Skip if test products already exist
    const testProductCount = await Product.countDocuments({ name: /\[TEST\]/ });
    if (testProductCount > 0) {
      console.log('ℹ️  Database already seeded with test products. Nothing to do.');
      process.exit(0);
    }

    // Create test categories (3 levels deep)
    const electronics = await Category.create({ name: 'Electronics', description: 'Electronic devices and gadgets', level: 1, parentId: null });
    const computers = await Category.create({ name: 'Computers', description: 'Desktop and laptop computers', level: 2, parentId: electronics._id });
    const laptops = await Category.create({ name: 'Laptops', description: 'Portable computers', level: 3, parentId: computers._id });
    const phones = await Category.create({ name: 'Phones', description: 'Mobile phones and accessories', level: 2, parentId: electronics._id });
    const smartphones = await Category.create({ name: 'Smartphones', description: 'Smart mobile phones', level: 3, parentId: phones._id });
    const clothing = await Category.create({ name: 'Clothing', description: 'Apparel and fashion', level: 1, parentId: null });
    const menClothing = await Category.create({ name: "Men's Clothing", description: 'Clothing for men', level: 2, parentId: clothing._id });
    const shirts = await Category.create({ name: 'Shirts', description: 'Men shirts', level: 3, parentId: menClothing._id });
    const home = await Category.create({ name: 'Home & Garden', description: 'Home and garden products', level: 1, parentId: null });
    const furniture = await Category.create({ name: 'Furniture', description: 'Home furniture', level: 2, parentId: home._id });
    const chairs = await Category.create({ name: 'Chairs', description: 'Seating furniture', level: 3, parentId: furniture._id });

    const sampleImages = [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
      'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    ];

    const products = [
      // Electronics - Laptops
      { name: '[TEST] Dell XPS 15 Laptop', description: 'High-performance laptop with Intel i7, 16GB RAM, 512GB SSD.', price: Math.round(1299.99 * USD_TO_CRC), stock: 15, lowStockThreshold: 5, category1Id: electronics._id, category2Id: computers._id, category3Id: laptops._id, images: [{ url: sampleImages[0], publicId: 'test1', isMain: true }, { url: sampleImages[1], publicId: 'test1-2', isMain: false }] },
      { name: '[TEST] MacBook Pro 16"', description: 'Apple M2 Pro chip, 32GB unified memory, 1TB SSD.', price: Math.round(2499.99 * USD_TO_CRC), stock: 8, lowStockThreshold: 3, category1Id: electronics._id, category2Id: computers._id, category3Id: laptops._id, images: [{ url: sampleImages[2], publicId: 'test2', isMain: true }] },
      { name: '[TEST] HP Pavilion Gaming Laptop', description: 'AMD Ryzen 7, NVIDIA RTX 3060, 16GB RAM, 512GB SSD.', price: Math.round(899.99 * USD_TO_CRC), stock: 22, lowStockThreshold: 10, category1Id: electronics._id, category2Id: computers._id, category3Id: laptops._id, images: [{ url: sampleImages[3], publicId: 'test3', isMain: true }] },
      { name: '[TEST] Lenovo ThinkPad X1 Carbon', description: 'Business ultrabook with Intel i7, 16GB RAM, 256GB SSD.', price: Math.round(1499.99 * USD_TO_CRC), stock: 3, lowStockThreshold: 5, category1Id: electronics._id, category2Id: computers._id, category3Id: laptops._id, images: [{ url: sampleImages[4], publicId: 'test4', isMain: true }] },
      { name: '[TEST] ASUS ROG Gaming Laptop', description: 'Intel i9, RTX 4080, 32GB RAM, 2TB SSD.', price: Math.round(2899.99 * USD_TO_CRC), stock: 0, lowStockThreshold: 2, category1Id: electronics._id, category2Id: computers._id, category3Id: laptops._id, images: [{ url: sampleImages[0], publicId: 'test5', isMain: true }] },
      // Electronics - Smartphones
      { name: '[TEST] iPhone 15 Pro', description: 'A17 Pro chip, 256GB storage, ProMotion display.', price: Math.round(1099.99 * USD_TO_CRC), stock: 45, lowStockThreshold: 15, category1Id: electronics._id, category2Id: phones._id, category3Id: smartphones._id, images: [{ url: sampleImages[1], publicId: 'test6', isMain: true }, { url: sampleImages[2], publicId: 'test6-2', isMain: false }] },
      { name: '[TEST] Samsung Galaxy S24 Ultra', description: 'S Pen, 200MP camera, 512GB storage.', price: Math.round(1199.99 * USD_TO_CRC), stock: 38, lowStockThreshold: 10, category1Id: electronics._id, category2Id: phones._id, category3Id: smartphones._id, images: [{ url: sampleImages[3], publicId: 'test7', isMain: true }] },
      { name: '[TEST] Google Pixel 8 Pro', description: 'Pure Android with AI features and camera.', price: Math.round(899.99 * USD_TO_CRC), stock: 27, lowStockThreshold: 8, category1Id: electronics._id, category2Id: phones._id, category3Id: smartphones._id, images: [{ url: sampleImages[4], publicId: 'test8', isMain: true }] },
      { name: '[TEST] OnePlus 12', description: 'Snapdragon 8 Gen 3, 16GB RAM, 256GB storage.', price: Math.round(799.99 * USD_TO_CRC), stock: 19, lowStockThreshold: 10, category1Id: electronics._id, category2Id: phones._id, category3Id: smartphones._id, images: [{ url: sampleImages[0], publicId: 'test9', isMain: true }] },
      { name: '[TEST] Xiaomi 14 Pro', description: 'Leica camera system, premium specs.', price: Math.round(699.99 * USD_TO_CRC), stock: 5, lowStockThreshold: 8, category1Id: electronics._id, category2Id: phones._id, category3Id: smartphones._id, images: [{ url: sampleImages[1], publicId: 'test10', isMain: true }] },
      // Clothing - Shirts
      { name: '[TEST] Classic White Oxford Shirt', description: '100% cotton, slim fit.', price: Math.round(49.99 * USD_TO_CRC), stock: 120, lowStockThreshold: 30, category1Id: clothing._id, category2Id: menClothing._id, category3Id: shirts._id, images: [{ url: sampleImages[2], publicId: 'test11', isMain: true }] },
      { name: '[TEST] Linen Summer Shirt', description: 'Breathable linen fabric.', price: Math.round(59.99 * USD_TO_CRC), stock: 85, lowStockThreshold: 25, category1Id: clothing._id, category2Id: menClothing._id, category3Id: shirts._id, images: [{ url: sampleImages[3], publicId: 'test12', isMain: true }] },
      { name: '[TEST] Flannel Plaid Shirt', description: 'Warm and cozy for winter.', price: Math.round(44.99 * USD_TO_CRC), stock: 2, lowStockThreshold: 20, category1Id: clothing._id, category2Id: menClothing._id, category3Id: shirts._id, images: [{ url: sampleImages[4], publicId: 'test13', isMain: true }] },
      { name: '[TEST] Denim Chambray Shirt', description: 'Versatile denim shirt.', price: Math.round(54.99 * USD_TO_CRC), stock: 67, lowStockThreshold: 15, category1Id: clothing._id, category2Id: menClothing._id, category3Id: shirts._id, images: [{ url: sampleImages[0], publicId: 'test14', isMain: true }] },
      { name: '[TEST] Performance Polo Shirt', description: 'Moisture-wicking fabric.', price: Math.round(39.99 * USD_TO_CRC), stock: 95, lowStockThreshold: 30, category1Id: clothing._id, category2Id: menClothing._id, category3Id: shirts._id, images: [{ url: sampleImages[1], publicId: 'test15', isMain: true }] },
      // Home - Chairs
      { name: '[TEST] Ergonomic Office Chair', description: 'Lumbar support, adjustable height.', price: Math.round(299.99 * USD_TO_CRC), stock: 34, lowStockThreshold: 10, category1Id: home._id, category2Id: furniture._id, category3Id: chairs._id, images: [{ url: sampleImages[2], publicId: 'test16', isMain: true }, { url: sampleImages[3], publicId: 'test16-2', isMain: false }] },
      { name: '[TEST] Gaming Chair RGB', description: 'Racing style with RGB lighting.', price: Math.round(349.99 * USD_TO_CRC), stock: 18, lowStockThreshold: 8, category1Id: home._id, category2Id: furniture._id, category3Id: chairs._id, images: [{ url: sampleImages[4], publicId: 'test17', isMain: true }] },
      { name: '[TEST] Wooden Dining Chair Set', description: 'Set of 4 solid wood chairs.', price: Math.round(399.99 * USD_TO_CRC), stock: 12, lowStockThreshold: 5, category1Id: home._id, category2Id: furniture._id, category3Id: chairs._id, images: [{ url: sampleImages[0], publicId: 'test18', isMain: true }] },
      { name: '[TEST] Velvet Accent Chair', description: 'Luxurious velvet upholstery.', price: Math.round(449.99 * USD_TO_CRC), stock: 0, lowStockThreshold: 3, category1Id: home._id, category2Id: furniture._id, category3Id: chairs._id, images: [{ url: sampleImages[1], publicId: 'test19', isMain: true }] },
      { name: '[TEST] Recliner Chair with Ottoman', description: 'Comfortable recliner with ottoman.', price: Math.round(599.99 * USD_TO_CRC), stock: 9, lowStockThreshold: 5, category1Id: home._id, category2Id: furniture._id, category3Id: chairs._id, images: [{ url: sampleImages[2], publicId: 'test20', isMain: true }] },
      // Products without level 3 categories
      { name: '[TEST] Wireless Mouse', description: 'Ergonomic wireless mouse.', price: Math.round(29.99 * USD_TO_CRC), stock: 150, lowStockThreshold: 40, category1Id: electronics._id, category2Id: computers._id, category3Id: null, images: [{ url: sampleImages[3], publicId: 'test21', isMain: true }] },
      { name: '[TEST] Mechanical Keyboard', description: 'RGB backlit, Cherry MX switches.', price: Math.round(119.99 * USD_TO_CRC), stock: 42, lowStockThreshold: 15, category1Id: electronics._id, category2Id: computers._id, category3Id: null, images: [{ url: sampleImages[4], publicId: 'test22', isMain: true }] },
      { name: '[TEST] Phone Case Premium', description: 'Military-grade drop protection.', price: Math.round(24.99 * USD_TO_CRC), stock: 230, lowStockThreshold: 50, category1Id: electronics._id, category2Id: phones._id, category3Id: null, images: [{ url: sampleImages[0], publicId: 'test23', isMain: true }] },
      { name: '[TEST] Designer Jeans', description: 'Premium denim, slim fit.', price: Math.round(89.99 * USD_TO_CRC), stock: 6, lowStockThreshold: 20, category1Id: clothing._id, category2Id: menClothing._id, category3Id: null, images: [{ url: sampleImages[1], publicId: 'test24', isMain: true }] },
      { name: '[TEST] Table Lamp Modern', description: 'Dimmable LED, touch control.', price: Math.round(79.99 * USD_TO_CRC), stock: 55, lowStockThreshold: 12, category1Id: home._id, category2Id: furniture._id, category3Id: null, images: [{ url: sampleImages[2], publicId: 'test25', isMain: true }] },
    ];

    await Product.insertMany(products);

    console.log('\n🎉 Seeded 11 categories and 25 test products across 3 category levels!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding test data:', error);
    process.exit(1);
  }
}

seedTestData();
