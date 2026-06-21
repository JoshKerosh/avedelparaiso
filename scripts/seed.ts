import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local FIRST. Static imports are hoisted above this call, so any module
// that reads env at load time (e.g. lib/mongodb.ts, which throws on a missing
// MONGODB_URI) must be imported dynamically below — after env is populated.
config({ path: resolve(process.cwd(), '.env.local') });

async function seed() {
  const { default: bcrypt } = await import('bcryptjs');
  const { randomBytes } = await import('crypto');
  const { default: connectDB } = await import('../lib/mongodb');
  const { default: User } = await import('../models/User');
  const { default: Settings } = await import('../models/Settings');

  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected successfully!');

    // Admin credentials come from env. Never hardcode admin/admin.
    const adminUser = process.env.SEED_ADMIN_USER || 'admin';
    let adminPassword = process.env.SEED_ADMIN_PASSWORD;
    let generated = false;
    if (!adminPassword) {
      // Generate a strong random password and show it exactly once.
      adminPassword = randomBytes(18).toString('base64url');
      generated = true;
    }

    // Create admin user
    const existingUser = await User.findOne({ username: adminUser });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        username: adminUser,
        password: hashedPassword,
      });
      console.log(`✅ Admin user created (username: ${adminUser})`);
      if (generated) {
        console.log('\n⚠️  No SEED_ADMIN_PASSWORD set — generated a temporary password.');
        console.log('   Copy it now; it will NOT be shown again:');
        console.log(`\n   ${adminPassword}\n`);
        console.log('   Change it after your first login.');
      }
    } else {
      console.log('ℹ️  Admin user already exists (password unchanged)');
    }

    // Create default settings
    const existingSettings = await Settings.findOne();
    
    if (!existingSettings) {
      await Settings.create({
        heroBannerUrl: '',
        heroBannerPublicId: '',
      });
      console.log('✅ Default settings created');
    } else {
      console.log('ℹ️  Settings already exist');
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nYou can now:');
    console.log(`1. Login to admin panel as "${adminUser}" with the password above`);
    console.log('2. Upload a hero banner in Settings');
    console.log('3. Create categories in Admin > Categories');
    console.log('4. Add products in Admin > Products');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
