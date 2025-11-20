import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const users = [
      { username: 'margarita', password: 'romeo2011' },
      { username: 'joshua', password: 'neko1089' }
    ];

    const created = [];
    const existing = [];

    for (const userData of users) {
      const existingUser = await User.findOne({ username: userData.username });
      
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await User.create({
          username: userData.username,
          password: hashedPassword,
        });
        created.push(userData.username);
      } else {
        existing.push(userData.username);
      }
    }

    return NextResponse.json({ 
      success: true, 
      created,
      existing,
      message: `Created ${created.length} new users. ${existing.length} already existed.`
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
