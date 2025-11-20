import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local FIRST before any other imports
config({ path: resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../lib/mongodb';
import User from '../models/User';
import Settings from '../models/Settings';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected successfully!');

    // Create admin user
    const existingUser = await User.findOne({ username: 'admin' });
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
      });
      console.log('✅ Admin user created (username: admin, password: admin)');
    } else {
      console.log('ℹ️  Admin user already exists');
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
    console.log('1. Login to admin panel with username: admin, password: admin');
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
