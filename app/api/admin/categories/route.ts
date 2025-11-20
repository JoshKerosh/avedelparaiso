import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const parentId = searchParams.get('parentId');

    const query: any = {};
    
    if (level) {
      query.level = parseInt(level);
    }
    
    if (parentId === 'null' || parentId === null) {
      query.parentId = null;
    } else if (parentId) {
      query.parentId = parentId;
    }

    const categories = await Category.find(query)
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { name, description, parentId, level } = body;

    // Validate level matches parent
    if (level === 1 && parentId) {
      return NextResponse.json({ error: 'Level 1 categories cannot have a parent' }, { status: 400 });
    }

    if (level > 1 && !parentId) {
      return NextResponse.json({ error: `Level ${level} categories must have a parent` }, { status: 400 });
    }

    // Check for unique name within same parent
    const existingCategory = await Category.findOne({
      name: name.trim(),
      parentId: parentId || null,
    });

    if (existingCategory) {
      return NextResponse.json({ error: 'A category with this name already exists at this level' }, { status: 400 });
    }

    const category = await Category.create({
      name: name.trim(),
      description,
      parentId: parentId || null,
      level,
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
