import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { handleApiError } from '@/lib/apiError';

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
  } catch (error) {
    return handleApiError(error);
  }
}
