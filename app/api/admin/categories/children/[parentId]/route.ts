import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ parentId: string }> }
) {
  try {
    await connectDB();
    const { parentId } = await params;

    const categories = await Category.find({ parentId: parentId === 'null' ? null : parentId })
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Error fetching child categories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
