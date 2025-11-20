import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local FIRST before any other imports
config({ path: resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../lib/mongodb';
import User from '../models/User';

async function addUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected successfully!');

    // Create margarita user
    const existingMargarita = await User.findOne({ username: 'margarita' });
    
    if (!existingMargarita) {
      const hashedPassword = await bcrypt.hash('romeo2011', 10);
      await User.create({
        username: 'margarita',
        password: hashedPassword,
      });
      console.log('✅ User "margarita" created');
    } else {
      console.log('ℹ️  User "margarita" already exists');
    }

    // Create joshua user
    const existingJoshua = await User.findOne({ username: 'joshua' });
    
    if (!existingJoshua) {
      const hashedPassword = await bcrypt.hash('neko1089', 10);
      await User.create({
        username: 'joshua',
        password: hashedPassword,
      });
      console.log('✅ User "joshua" created');
    } else {
      console.log('ℹ️  User "joshua" already exists');
    }

    console.log('\n🎉 Users added successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding users:', error);
    process.exit(1);
  }
}

addUsers();
